"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// -------------------------------------------------------
// T1 ENVÍOS — Registro de Asistencia de Operadores
// Tabla requerida en Supabase:
//   CREATE TABLE asistencia (
//     id          bigserial PRIMARY KEY,
//     fecha       date NOT NULL,
//     timestamp   timestamptz NOT NULL DEFAULT now(),
//     proveedor   text NOT NULL,
//     nombre_operador text NOT NULL,
//     tipo_unidad text NOT NULL,
//     tipo_operacion  text NOT NULL,
//     latitud     float8,
//     longitud    float8
//   );
// -------------------------------------------------------

const supabase = createClient(
  "https://owhsbmtroxzhscpzozts.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93aHNibXRyb3h6aHNjcHpvenRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTI4NTMsImV4cCI6MjA4ODEyODg1M30.CU1IiseDJnjk8F8L2DaIDbU3UJk1RrRTK61nJe7Oiec"
);

const WAREHOUSE_LAT = 19.398892731487283;
const WAREHOUSE_LON = -99.11677448852873;
const MAX_DISTANCE_METERS = 500;

const TIPOS_OPERACION = ["Última Milla", "CrossDock", "Logística Inversa"];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const S = {
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#0C1425",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    width: "100%",
    padding: "11px 13px",
    borderRadius: 8,
    border: "1.5px solid #E2E6EE",
    fontSize: 14,
    color: "#0C1425",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "white",
  },
  select: {
    width: "100%",
    padding: "11px 13px",
    borderRadius: 8,
    border: "1.5px solid #E2E6EE",
    fontSize: 14,
    color: "#0C1425",
    outline: "none",
    backgroundColor: "white",
    boxSizing: "border-box",
    appearance: "none",
    cursor: "pointer",
  },
};

export default function CheckinPage() {
  const [carriers, setCarriers] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [form, setForm] = useState({
    proveedor: "",
    nombre: "",
    tipo_unidad: "",
    tipo_operacion: "",
  });
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    Promise.all([
      supabase.from("carriers").select("*").order("proveedor"),
      supabase.from("operadores").select("*").eq("activo", true).order("nombre"),
    ]).then(([{ data: cData }, { data: oData }]) => {
      setCarriers((cData || []).filter((c) => c.tipo_unidad && c.tipo_unidad !== "—"));
      setOperadores(oData || []);
    });
  }, []);

  const proveedores = [...new Set(carriers.map((c) => c.proveedor))].sort();
  const tiposUnidad = carriers
    .filter((c) => c.proveedor === form.proveedor)
    .map((c) => c.tipo_unidad);
  const operadoresFiltrados = operadores.filter((o) => o.proveedor === form.proveedor);

  const requestLocation = () => {
    setLocationLoading(true);
    setLocationError("");
    setLocation(null);
    setDistance(null);

    if (!navigator.geolocation) {
      setLocationError("Tu dispositivo no soporta geolocalización.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const dist = haversineDistance(latitude, longitude, WAREHOUSE_LAT, WAREHOUSE_LON);
        setLocation({ latitude, longitude });
        setDistance(dist);
        setLocationLoading(false);
      },
      () => {
        setLocationError(
          "No se pudo obtener tu ubicación. Verifica que tu navegador tenga permiso de acceso."
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const isLocationValid = location !== null && distance !== null && distance <= MAX_DISTANCE_METERS;
  const isFormValid =
    form.proveedor &&
    form.nombre &&
    form.tipo_unidad &&
    form.tipo_operacion &&
    isLocationValid;

  const handleSubmit = async () => {
    if (!isFormValid || submitStatus === "submitting") return;
    setSubmitStatus("submitting");
    setErrorMsg("");

    // Fecha LOCAL del operador (no UTC). toISOString() convierte a UTC y eso
    // hace que registros tomados después de las 18:00 hora México (UTC-6)
    // se guarden con la fecha del día siguiente — provocando que "no aparezcan"
    // en el filtro del día correcto.
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const now = new Date().toISOString();

    // Find unit cost from carriers
    const carrierRow = carriers.find(
      (c) => c.proveedor === form.proveedor && c.tipo_unidad === form.tipo_unidad
    );
    const costoUnit = carrierRow ? parseFloat(carrierRow.costo_unidad) || 0 : 0;

    // 1. Guardar en tabla asistencia
    const { error: asistenciaError } = await supabase.from("asistencia").insert({
      fecha: today,
      timestamp: now,
      proveedor: form.proveedor,
      nombre_operador: form.nombre.trim(),
      tipo_unidad: form.tipo_unidad,
      tipo_operacion: form.tipo_operacion,
      latitud: location.latitude,
      longitud: location.longitude,
    });

    if (asistenciaError) {
      setSubmitStatus("error");
      setErrorMsg(asistenciaError.message);
      return;
    }

    // 2. Auto-registrar en Registro Diario (costos)
    await supabase.from("costos").insert({
      fecha: today,
      unidad: form.proveedor + " - " + form.tipo_unidad,
      tipo: form.tipo_operacion,
      monto: costoUnit,
      litros: 1,
      km: costoUnit,
      factura: null,
      notas: "Auto-registro: " + form.nombre.trim(),
    });

    setSubmitStatus("success");
  };

  // ── Pantalla de éxito ────────────────────────────────────────
  if (submitStatus === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#F8F9FC",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "#DCFCE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            fontSize: 34,
          }}
        >
          ✓
        </div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0C1425",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          ¡Asistencia registrada!
        </h2>
        <p
          style={{
            color: "#7C8495",
            fontSize: 14,
            marginBottom: 28,
            textAlign: "center",
            maxWidth: 320,
          }}
        >
          Tu registro fue guardado y el Registro Diario se actualizó automáticamente.
        </p>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 20,
            border: "1px solid #E2E6EE",
            width: "100%",
            maxWidth: 360,
          }}
        >
          {[
            ["Operador", form.nombre],
            ["Proveedor", form.proveedor],
            ["Tipo de unidad", form.tipo_unidad],
            ["Operación", form.tipo_operacion],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7C8495", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>
                {lbl}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#0C1425" }}>{val}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setForm({ proveedor: "", nombre: "", tipo_unidad: "", tipo_operacion: "" });
            setLocation(null);
            setDistance(null);
            setSubmitStatus("idle");
          }}
          style={{
            marginTop: 20,
            padding: "10px 28px",
            borderRadius: 8,
            border: "1.5px solid #E2E6EE",
            backgroundColor: "transparent",
            color: "#7C8495",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Nuevo registro
        </button>
      </div>
    );
  }

  // ── Formulario principal ─────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F9FC", paddingBottom: 48 }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "#0C1425",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 900, color: "#E63B2E" }}>T1</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: "0.05em",
          }}
        >
          ENVÍOS
        </span>
        <span
          style={{
            marginLeft: 4,
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          / Check-in
        </span>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 20px 0" }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0C1425",
            marginBottom: 4,
          }}
        >
          Registro de asistencia
        </h1>
        <p style={{ fontSize: 14, color: "#7C8495", marginBottom: 28 }}>
          Regístrate al llegar al almacén para cargar tu unidad.
        </p>

        {/* ── Paso 1: Ubicación ── */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 20,
            marginBottom: 14,
            border: `1.5px solid ${isLocationValid ? "#16A34A" : "#E2E6EE"}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: isLocationValid ? "#DCFCE7" : "#F8F9FC",
                border: `1.5px solid ${isLocationValid ? "#16A34A" : "#CBD5E1"}`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: isLocationValid ? "#16A34A" : "#7C8495",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              1
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0C1425" }}>
              Verificar ubicación
            </span>
            {isLocationValid && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#16A34A",
                  backgroundColor: "#DCFCE7",
                  padding: "2px 10px",
                  borderRadius: 20,
                }}
              >
                Verificado
              </span>
            )}
          </div>

          {!location && !locationLoading && (
            <button
              onClick={requestLocation}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#E63B2E",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📍 Verificar mi ubicación
            </button>
          )}

          {locationLoading && (
            <div
              style={{
                textAlign: "center",
                color: "#7C8495",
                fontSize: 14,
                padding: "8px 0",
              }}
            >
              Obteniendo ubicación...
            </div>
          )}

          {location && !isLocationValid && !locationLoading && (
            <div>
              <div
                style={{
                  color: "#DC2626",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 12,
                  padding: "10px 12px",
                  backgroundColor: "#FEE2E2",
                  borderRadius: 8,
                }}
              >
                Estás a {Math.round(distance)} m del almacén. Debes estar a menos de{" "}
                {MAX_DISTANCE_METERS} m para registrarte.
              </div>
              <button
                onClick={requestLocation}
                disabled={locationLoading}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "1.5px solid #E63B2E",
                  backgroundColor: "transparent",
                  color: "#E63B2E",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Reintentar
              </button>
            </div>
          )}

          {isLocationValid && (
            <div style={{ color: "#16A34A", fontSize: 14, fontWeight: 500 }}>
              ✓ A {Math.round(distance)} m del almacén
            </div>
          )}

          {locationError && (
            <div
              style={{
                color: "#DC2626",
                fontSize: 13,
                marginTop: 8,
                padding: "8px 12px",
                backgroundColor: "#FEE2E2",
                borderRadius: 8,
              }}
            >
              {locationError}
            </div>
          )}
        </div>

        {/* ── Paso 2: Datos ── */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 20,
            border: "1.5px solid #E2E6EE",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: "#F8F9FC",
                border: "1.5px solid #CBD5E1",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#7C8495",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              2
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0C1425" }}>
              Datos del operador
            </span>
          </div>

          {/* Proveedor */}
          <label style={S.label}>Proveedor</label>
          <div style={{ position: "relative" }}>
            <select
              value={form.proveedor}
              onChange={(e) =>
                setForm({ ...form, proveedor: e.target.value, tipo_unidad: "" })
              }
              style={S.select}
            >
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#7C8495",
              }}
            >
              ▾
            </span>
          </div>

          {/* Nombre */}
          <label style={S.label}>Nombre del operador</label>
          <div style={{ position: "relative" }}>
            <select
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              disabled={!form.proveedor}
              style={{
                ...S.select,
                opacity: form.proveedor ? 1 : 0.45,
                cursor: form.proveedor ? "pointer" : "not-allowed",
              }}
            >
              <option value="">
                {form.proveedor
                  ? operadoresFiltrados.length > 0
                    ? "Seleccionar operador..."
                    : "Sin operadores registrados para este proveedor"
                  : "Primero elige un proveedor"}
              </option>
              {operadoresFiltrados.map((o) => (
                <option key={o.id} value={o.nombre}>
                  {o.nombre}
                </option>
              ))}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#7C8495" }}>▾</span>
          </div>

          {/* Tipo de unidad */}
          <label style={S.label}>Tipo de unidad</label>
          <div style={{ position: "relative" }}>
            <select
              value={form.tipo_unidad}
              onChange={(e) => setForm({ ...form, tipo_unidad: e.target.value })}
              disabled={!form.proveedor}
              style={{
                ...S.select,
                opacity: form.proveedor ? 1 : 0.45,
                cursor: form.proveedor ? "pointer" : "not-allowed",
              }}
            >
              <option value="">
                {form.proveedor ? "Seleccionar tipo..." : "Primero elige un proveedor"}
              </option>
              {tiposUnidad.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#7C8495",
              }}
            >
              ▾
            </span>
          </div>

          {/* Tipo de operación */}
          <label style={S.label}>Tipo de operación</label>
          <div style={{ position: "relative" }}>
            <select
              value={form.tipo_operacion}
              onChange={(e) => setForm({ ...form, tipo_operacion: e.target.value })}
              style={S.select}
            >
              <option value="">Seleccionar operación...</option>
              {TIPOS_OPERACION.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#7C8495",
              }}
            >
              ▾
            </span>
          </div>

          {/* Error */}
          {submitStatus === "error" && (
            <div
              style={{
                color: "#DC2626",
                fontSize: 13,
                marginTop: 14,
                padding: "10px 12px",
                backgroundColor: "#FEE2E2",
                borderRadius: 8,
              }}
            >
              Error: {errorMsg}
            </div>
          )}

          {/* Botón */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || submitStatus === "submitting"}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 8,
              border: "none",
              backgroundColor: isFormValid ? "#E63B2E" : "#E2E6EE",
              color: isFormValid ? "white" : "#7C8495",
              fontSize: 15,
              fontWeight: 700,
              cursor: isFormValid ? "pointer" : "not-allowed",
              marginTop: 20,
              transition: "background-color 0.15s",
            }}
          >
            {submitStatus === "submitting" ? "Registrando..." : "Registrar asistencia"}
          </button>

          {!isLocationValid && (
            <p
              style={{
                fontSize: 12,
                color: "#7C8495",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Debes verificar tu ubicación antes de registrarte
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
