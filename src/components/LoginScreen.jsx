"use client";
import { useState } from "react";

const C = {
  bg: "#0A0F1A",
  accent: "#4C8DFF",
  text: "#E8EEF9",
  textMuted: "#8295B2",
  white: "#111A2B",
  panelGrad: "linear-gradient(160deg,#111A2B,#0E1626)",
  inputBg: "#0E1626",
  border: "#22304A",
  red: "#F0556D",
  redBg: "rgba(240,85,109,0.15)",
};

export default function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user === "admin" && pass === "almacen2026") {
      onLogin();
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: C.bg, fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <form onSubmit={handleSubmit} style={{ width: 360, background: C.panelGrad, borderRadius: 16, padding: 40, border: "1px solid " + C.border, boxShadow: "0 8px 32px rgba(0,0,0,0.45)", textAlign: "center" }}>
        <div style={{ marginBottom: 4 }}>
          <img src="https://t1envios.com/assets/images/logos/T1Paginas.svg" alt="T1 Envíos" style={{ height: 44, objectFit: "contain" }} />
        </div>
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 32 }}>OPS Flotilla — Iniciar sesión</div>
        {error && <div style={{ fontSize: 13, color: C.red, backgroundColor: C.redBg, padding: "8px 12px", borderRadius: 8, marginBottom: 16 }}>{error}</div>}
        <div style={{ marginBottom: 16, textAlign: "left" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Usuario</label>
          <input value={user} onChange={e => setUser(e.target.value)} placeholder="Usuario" style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1.5px solid " + C.border, fontSize: 14, outline: "none", boxSizing: "border-box", backgroundColor: C.inputBg, color: C.text }} />
        </div>
        <div style={{ marginBottom: 24, textAlign: "left" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Contraseña</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Contraseña" style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1.5px solid " + C.border, fontSize: 14, outline: "none", boxSizing: "border-box", backgroundColor: C.inputBg, color: C.text }} />
        </div>
        <button type="submit" style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", backgroundColor: C.accent, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}
