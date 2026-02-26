"use client";
import { useState, useEffect } from "react";

// ============================================================
// T1 ENVÍOS — OPS FLOTILLA KPI PLATFORM
// Replaces: Google Sheets (capture) + Looker Studio (dashboard)
// ============================================================

const C = {
  bg: "#F8F9FC",
  sidebar: "#0C1425",
  sidebarHover: "#1A2540",
  sidebarActive: "#1E3A5F",
  accent: "#E63B2E",
  accentDark: "#C42E23",
  accentLight: "#FDECEA",
  text: "#0C1425",
  textMuted: "#7C8495",
  border: "#E2E6EE",
  white: "#FFFFFF",
  green: "#16A34A",
  greenBg: "#DCFCE7",
  yellow: "#D97706",
  yellowBg: "#FEF9C3",
  red: "#DC2626",
  redBg: "#FEE2E2",
  blue: "#2563EB",
  blueBg: "#DBEAFE",
  purple: "#7C3AED",
  purpleBg: "#EDE9FE",
};

const IC = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Truck: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Package: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Warehouse: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"/><path d="M3 7v14"/><path d="M21 7v14"/><path d="M3 7l9-4 9 4"/><rect x="7" y="11" width="4" height="4"/><rect x="13" y="11" width="4" height="4"/></svg>,
  Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>,
  Clock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Dollar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Fuel: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16"/><path d="M15 10h2a2 2 0 012 2v3a2 2 0 002 2h0a2 2 0 002-2V9l-3-3"/><rect x="5" y="8" width="8" height="4"/></svg>,
  BarChart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  ChevronDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 12,15 18,9"/></svg>,
  ArrowUp: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/></svg>,
  ArrowDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19,12 12,19 5,12"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Map: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
};

// ---- NAV ITEMS ----
const navSections = [
  { label: "DASHBOARD", items: [
    { id: "dashboard", label: "Dashboard OPS", icon: IC.Dashboard },
  ]},
  { label: "CAPTURA DE DATOS", items: [
    { id: "envios", label: "Registrar Envíos", icon: IC.Package, badge: "Nuevo" },
    { id: "unidades", label: "Unidades", icon: IC.Truck },
    { id: "operadores", label: "Operadores", icon: IC.Users },
    { id: "costos", label: "Costos / Gastos", icon: IC.Dollar },
  ]},
  { label: "OPERACIONES", items: [
    { id: "t1envios", label: "T1 Envíos", icon: IC.Package },
    { id: "warehouse", label: "Warehouse", icon: IC.Warehouse },
    { id: "halfmile", label: "HalfMile", icon: IC.Map },
    { id: "sameday", label: "Same Day", icon: IC.Zap },
  ]},
  { label: "SISTEMA", items: [
    { id: "config", label: "Configuración", icon: IC.Settings },
  ]},
];

// ---- MOCK DATA ----
const mockEnvios = [
  { id: "ENV-4201", fecha: "2026-02-26", unidad: "T1-015", operador: "Miguel Ángel Reyes", origen: "CDMX Reforma", destino: "GDL Centro", paquetes: 84, peso: 420, status: "En tránsito", tipo: "T1 Envíos" },
  { id: "ENV-4200", fecha: "2026-02-26", unidad: "T1-008", operador: "Carlos Mendoza", origen: "CDMX Norte", destino: "MTY Apodaca", paquetes: 62, peso: 310, status: "Entregado", tipo: "T1 Envíos" },
  { id: "ENV-4199", fecha: "2026-02-26", unidad: "T1-022", operador: "Roberto Sánchez", origen: "CDMX Sur", destino: "QRO Industrial", paquetes: 45, peso: 225, status: "Entregado", tipo: "HalfMile" },
  { id: "ENV-4198", fecha: "2026-02-25", unidad: "T1-003", operador: "Juan Pablo Torres", origen: "CDMX Reforma", destino: "PUE Centro", paquetes: 38, peso: 190, status: "Entregado", tipo: "Same Day" },
  { id: "ENV-4197", fecha: "2026-02-25", unidad: "T1-011", operador: "Fernando López", origen: "GDL Norte", destino: "AGS Centro", paquetes: 29, peso: 145, status: "Incidencia", tipo: "Warehouse" },
  { id: "ENV-4196", fecha: "2026-02-25", unidad: "T1-015", operador: "Miguel Ángel Reyes", origen: "CDMX Reforma", destino: "CUN Zona Hotelera", paquetes: 95, peso: 475, status: "Entregado", tipo: "T1 Envíos" },
  { id: "ENV-4195", fecha: "2026-02-24", unidad: "T1-008", operador: "Carlos Mendoza", origen: "CDMX Norte", destino: "SLP Industrial", paquetes: 51, peso: 255, status: "Entregado", tipo: "T1 Envíos" },
  { id: "ENV-4194", fecha: "2026-02-24", unidad: "T1-022", operador: "Roberto Sánchez", origen: "CDMX Sur", destino: "TLC Centro", paquetes: 33, peso: 165, status: "Entregado", tipo: "HalfMile" },
];

const mockUnidades = [
  { id: "T1-003", tipo: "Sprinter", placas: "ABC-123-A", modelo: "2023 Mercedes", km: 45200, status: "Activa", proxMantenimiento: "2026-03-15" },
  { id: "T1-008", tipo: "Sprinter", placas: "DEF-456-B", modelo: "2024 Mercedes", km: 28100, status: "Activa", proxMantenimiento: "2026-04-01" },
  { id: "T1-011", tipo: "3.5 Ton", placas: "GHI-789-C", modelo: "2023 Isuzu", km: 62300, status: "En mantenimiento", proxMantenimiento: "2026-02-28" },
  { id: "T1-015", tipo: "Sprinter", placas: "JKL-012-D", modelo: "2024 Mercedes", km: 18700, status: "Activa", proxMantenimiento: "2026-05-10" },
  { id: "T1-022", tipo: "Van", placas: "MNO-345-E", modelo: "2023 Nissan", km: 51800, status: "Activa", proxMantenimiento: "2026-03-22" },
  { id: "T1-030", tipo: "3.5 Ton", placas: "PQR-678-F", modelo: "2022 Isuzu", km: 89400, status: "Baja temporal", proxMantenimiento: "—" },
];

const mockOperadores = [
  { id: "OP-001", nombre: "Miguel Ángel Reyes", licencia: "E", vencimiento: "2027-06-15", unidad: "T1-015", entregas: 1842, pctEntrega: 97.2, status: "Activo" },
  { id: "OP-002", nombre: "Carlos Mendoza", licencia: "E", vencimiento: "2026-11-30", unidad: "T1-008", entregas: 1567, pctEntrega: 95.8, status: "Activo" },
  { id: "OP-003", nombre: "Roberto Sánchez", licencia: "C", vencimiento: "2027-03-20", unidad: "T1-022", entregas: 1203, pctEntrega: 94.1, status: "Activo" },
  { id: "OP-004", nombre: "Juan Pablo Torres", licencia: "E", vencimiento: "2026-08-10", unidad: "T1-003", entregas: 2105, pctEntrega: 96.5, status: "Activo" },
  { id: "OP-005", nombre: "Fernando López", licencia: "C", vencimiento: "2026-05-25", unidad: "T1-011", entregas: 987, pctEntrega: 92.3, status: "Incapacidad" },
];

// Monthly data for charts
const monthlyData = [
  { mes: "Sep", envios: 28450, entregas: 27180, pct: 95.5, costo: 1250000 },
  { mes: "Oct", envios: 31200, entregas: 29952, pct: 96.0, costo: 1380000 },
  { mes: "Nov", envios: 29800, entregas: 28608, pct: 96.0, costo: 1310000 },
  { mes: "Dic", envios: 35600, entregas: 33820, pct: 95.0, costo: 1520000 },
  { mes: "Ene", envios: 26100, entregas: 25056, pct: 96.0, costo: 1180000 },
  { mes: "Feb", envios: 30788, entregas: 29549, pct: 96.0, costo: 1345000 },
];

const opsBreakdown = [
  { tipo: "T1 Envíos", envios: 18200, entregas: 17654, pct: 97.0, costo: 845000, color: C.accent },
  { tipo: "Warehouse", envios: 5400, entregas: 5130, pct: 95.0, costo: 215000, color: C.blue },
  { tipo: "HalfMile", envios: 4188, entregas: 3936, pct: 94.0, costo: 168000, color: C.purple },
  { tipo: "Same Day", envios: 3000, entregas: 2829, pct: 94.3, costo: 117000, color: C.yellow },
];

// ============ COMPONENTS ============

function StatusBadge({ status }) {
  const map = {
    "Entregado": { bg: C.greenBg, color: C.green },
    "En tránsito": { bg: C.blueBg, color: C.blue },
    "Incidencia": { bg: C.redBg, color: C.red },
    "Pendiente": { bg: C.yellowBg, color: C.yellow },
    "Activa": { bg: C.greenBg, color: C.green },
    "Activo": { bg: C.greenBg, color: C.green },
    "En mantenimiento": { bg: C.yellowBg, color: C.yellow },
    "Baja temporal": { bg: C.redBg, color: C.red },
    "Incapacidad": { bg: C.purpleBg, color: C.purple },
  };
  const s = map[status] || { bg: "#F3F4F6", color: C.textMuted };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, backgroundColor: s.bg, color: s.color, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: s.color }} />
      {status}
    </span>
  );
}

function StatCard({ label, value, subvalue, trend, trendUp, icon, color }) {
  return (
    <div style={{ backgroundColor: C.white, borderRadius: 12, padding: "20px 22px", border: `1px solid ${C.border}`, flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: color + "18", display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
        {trend && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700, color: trendUp ? C.green : C.red }}>
            {trendUp ? <IC.ArrowUp /> : <IC.ArrowDown />} {trend}
          </span>
        )}
        {subvalue && <span style={{ fontSize: 11, color: C.textMuted }}>{subvalue}</span>}
      </div>
    </div>
  );
}

// Simple bar chart component
function MiniBarChart({ data, dataKey, color, height = 140 }) {
  const max = Math.max(...data.map(d => d[dataKey]));
  const barW = Math.floor((100 / data.length) - 2);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "2%", height, padding: "0 4px" }}>
      {data.map((d, i) => {
        const h = (d[dataKey] / max) * height * 0.85;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 600 }}>
              {dataKey === "costo" ? `$${(d[dataKey]/1000000).toFixed(1)}M` : d[dataKey].toLocaleString()}
            </span>
            <div style={{ width: "100%", height: h, backgroundColor: color, borderRadius: "4px 4px 0 0", minHeight: 4, opacity: i === data.length - 1 ? 1 : 0.7, transition: "all 0.3s" }} />
            <span style={{ fontSize: 10, color: C.textMuted }}>{d.mes}</span>
          </div>
        );
      })}
    </div>
  );
}

// Gauge chart
function GaugeChart({ value, label, size = 160 }) {
  const pct = Math.min(value, 100);
  const angle = (pct / 100) * 180;
  const r = size / 2 - 15;
  const cx = size / 2;
  const cy = size / 2 + 10;
  
  const polarToCart = (a, radius) => ({
    x: cx + radius * Math.cos((Math.PI * (180 - a)) / 180),
    y: cy - radius * Math.sin((Math.PI * (180 - a)) / 180),
  });
  
  const bgStart = polarToCart(0, r);
  const bgEnd = polarToCart(180, r);
  const valEnd = polarToCart(angle, r);
  const largeArc = angle > 180 ? 1 : 0;
  
  const color = pct >= 96 ? C.green : pct >= 93 ? C.yellow : C.red;
  
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size/2 + 30}`}>
        <path d={`M ${bgEnd.x} ${bgEnd.y} A ${r} ${r} 0 0 1 ${bgStart.x} ${bgStart.y}`}
          fill="none" stroke={C.border} strokeWidth="14" strokeLinecap="round" />
        {pct > 0 && (
          <path d={`M ${bgEnd.x} ${bgEnd.y} A ${r} ${r} 0 ${largeArc} 1 ${valEnd.x} ${valEnd.y}`}
            fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontSize: 28, fontWeight: 800, fill: C.text }}>{value}%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 11, fill: C.textMuted }}>{label}</text>
      </svg>
    </div>
  );
}

// Horizontal stacked bar for OPS breakdown
function OpsBar({ data }) {
  const total = data.reduce((s, d) => s + d.envios, 0);
  return (
    <div>
      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 28, marginBottom: 14 }}>
        {data.map((d, i) => (
          <div key={i} style={{ width: `${(d.envios/total)*100}%`, backgroundColor: d.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>{Math.round((d.envios/total)*100)}%</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: d.color }} />
            <span style={{ fontSize: 11, color: C.textMuted }}>{d.tipo}: <strong style={{ color: C.text }}>{d.envios.toLocaleString()}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ MODULES ============

// --- DASHBOARD ---
function ModuleDashboard() {
  const [periodo, setPeriodo] = useState("Febrero 2026");
  
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: C.text }}>Dashboard OPS</h1>
          <p style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>Métricas de flotilla propia · Datos en tiempo real</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={periodo} onChange={e => setPeriodo(e.target.value)} style={{
            padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, backgroundColor: C.white, cursor: "pointer", color: C.text,
          }}>
            <option>Febrero 2026</option><option>Enero 2026</option><option>Diciembre 2025</option>
            <option>Noviembre 2025</option><option>Octubre 2025</option>
          </select>
          <button style={{ padding: "8px 16px", borderRadius: 8, border: "none", backgroundColor: C.accent, color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <IC.Download /> Exportar
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <StatCard label="Envíos totales" value="30,788" trend="+8.2%" trendUp subvalue="vs mes anterior" icon={<IC.Package />} color={C.blue} />
        <StatCard label="Entregas" value="29,549" trend="+5.1%" trendUp subvalue="vs mes anterior" icon={<IC.Check />} color={C.green} />
        <StatCard label="% Entrega" value="96.0%" trend="+1.0%" trendUp subvalue="Target: 96%" icon={<IC.BarChart />} color={C.accent} />
        <StatCard label="Costo General" value="$1.34M" trend="-3.2%" trendUp subvalue="vs mes anterior" icon={<IC.Dollar />} color={C.purple} />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        {/* Gauge */}
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 22, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>% Entrega General</div>
          <GaugeChart value={96.0} label="Febrero 2026" size={180} />
        </div>
        {/* Envios bar */}
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 22, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Envíos por mes</div>
          <MiniBarChart data={monthlyData} dataKey="envios" color={C.accent} />
        </div>
        {/* Costo bar */}
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 22, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Costo por mes</div>
          <MiniBarChart data={monthlyData} dataKey="costo" color={C.purple} />
        </div>
      </div>

      {/* OPS Breakdown */}
      <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 22, border: `1px solid ${C.border}`, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16 }}>OPS — Distribución por tipo de operación</div>
        <OpsBar data={opsBreakdown} />
        <div style={{ marginTop: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {["Tipo", "Envíos", "Entregas", "% Entrega", "Costo", "Costo/Envío"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {opsBreakdown.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: row.color }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{row.tipo}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600 }}>{row.envios.toLocaleString()}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>{row.entregas.toLocaleString()}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: row.pct >= 96 ? C.green : row.pct >= 93 ? C.yellow : C.red }}>{row.pct}%</span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>${(row.costo/1000).toFixed(0)}K</td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: C.textMuted }}>${(row.costo/row.envios).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 22, border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Últimos envíos registrados</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["ID", "Fecha", "Unidad", "Operador", "Destino", "Paquetes", "Status"].map(h => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockEnvios.slice(0, 5).map((e, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px", fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: C.accent }}>{e.id}</td>
                <td style={{ padding: "10px", fontSize: 12, color: C.textMuted }}>{e.fecha}</td>
                <td style={{ padding: "10px", fontSize: 12, fontWeight: 600 }}>{e.unidad}</td>
                <td style={{ padding: "10px", fontSize: 12 }}>{e.operador}</td>
                <td style={{ padding: "10px", fontSize: 12 }}>{e.destino}</td>
                <td style={{ padding: "10px", fontSize: 12, fontWeight: 600 }}>{e.paquetes}</td>
                <td style={{ padding: "10px" }}><StatusBadge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- MINI CIRCLE GAUGE for Table Rows ---
function CircleGauge({ value, size = 40 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 90 ? C.green : value >= 75 ? "#3B82F6" : value >= 50 ? C.yellow : C.red;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={3} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span style={{ position: "absolute", fontSize: 9, fontWeight: 700, color }}>{Math.round(value)}%</span>
    </div>
  );
}

// --- Risk Icon ---
function RiskIcon({ level }) {
  if (level === "high") return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", backgroundColor: C.redBg, color: C.red, fontSize: 11, fontWeight: 800 }}>!</span>;
  if (level === "medium") return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", backgroundColor: C.yellowBg, color: C.yellow, fontSize: 11, fontWeight: 800 }}>!</span>;
  return null;
}

// --- REGISTRAR ENVÍOS (Data Capture Module) ---
function ModuleEnvios() {
  const [rutas, setRutas] = useState(mockRutas);
  const [filter, setFilter] = useState("Todas");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-02-26");

  const getRisk = (r) => {
    if (r.pctEntrega < 50) return "high";
    if (r.pctEntrega < 80 || r.noVisitados > r.total * 0.3) return "medium";
    return null;
  };

  const filtered = rutas.filter(r => {
    if (filter === "Todas") return true;
    if (filter === "En ruta") return r.status === "En curso";
    if (filter === "En riesgo") return getRisk(r) === "high" || getRisk(r) === "medium";
    if (filter === "Completadas") return r.status === "Completada";
    return true;
  });

  const totalRutas = rutas.length;
  const totalEntregados = rutas.reduce((s, r) => s + r.entregados, 0);
  const totalPaquetes = rutas.reduce((s, r) => s + r.total, 0);
  const pctGeneral = totalPaquetes > 0 ? ((totalEntregados / totalPaquetes) * 100).toFixed(1) : 0;
  const enCurso = rutas.filter(r => r.status === "En curso").length;
  const completadas = rutas.filter(r => r.status === "Completada").length;
  const enRiesgo = rutas.filter(r => getRisk(r)).length;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        // Parse with SheetJS - dynamically import
        import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs").then((XLSX) => {
          const data = new Uint8Array(evt.target.result);
          const wb = XLSX.read(data, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws);

          const parsed = json.map((row, i) => {
            const total = parseInt(row["Total"]) || 0;
            const entregados = parseInt(row["Entregados"]) || 0;
            const recolecciones = parseInt(row["Recolecciones"]) || 0;
            const pct = parseFloat(row["Porcentaje de entrega"]) || 0;
            const intentados = (parseInt(row["315-Not Delivered"]) || 0) + (parseInt(row["311-Not Home"]) || 0) + (parseInt(row["312-Business Closed"]) || 0) + (parseInt(row["313-Without access"]) || 0) + (parseInt(row["314-Wrong address"]) || 0) + (parseInt(row["316-Missing"]) || 0) + (parseInt(row["318-Reject by customer"]) || 0) + (parseInt(row["305-Codigo no proporcionado"]) || 0);
            const noVisitados = total - entregados - intentados;
            const salida = row["Fecha y hora de salida"] || "";
            const intercambios = (parseInt(row["Entregados en intento 2"]) || 0) + (parseInt(row["Entregados en intento 3"]) || 0) + (parseInt(row["Entregados en intento 4+"]) || 0);

            return {
              idRuta: row["ID ruta"] || `R-${i}`,
              carrier: row["Carrier"] || "—",
              operador: row["Nombre operador"] || "Sin nombre",
              correo: row["Correo operador"] || "",
              placa: row["Placa"] || "",
              almacen: row["Almacén (Facility que entrega)"] || "T1 ENVIOS",
              economico: row["Económico"] || "",
              status: row["Status"] || "En curso",
              total,
              entregados,
              recolecciones,
              pctEntrega: pct,
              intentados,
              noVisitados: noVisitados > 0 ? noVisitados : 0,
              salida: typeof salida === "string" ? salida : "",
              intercambios,
              kmEstimados: row["Kilometros estimados"] || "—",
              kmRecorridos: row["Kilometros recorridos"] || "—",
              tiempoEstimado: row["Tiempo estimado"] || "—",
              tiempoReal: row["Tiempo real en ruta"] || "—",
              tipoRuta: "Última milla",
            };
          });

          setRutas(parsed);
          setUploadMsg(`✓ ${parsed.length} rutas cargadas correctamente`);
          setUploading(false);
          setShowUpload(false);
        }).catch(() => {
          // Fallback: manual CSV-like parse
          setUploadMsg("Error: No se pudo cargar la librería de Excel. Intente con un archivo .csv");
          setUploading(false);
        });
      } catch (err) {
        setUploadMsg("Error al procesar el archivo: " + err.message);
        setUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Status indicator bar color
  const getBarColor = (r) => {
    if (r.status === "Completada") return C.green;
    if (getRisk(r) === "high") return C.red;
    if (getRisk(r) === "medium") return C.yellow;
    return "#F59E0B";
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Registrar Envíos</h1>
          <p style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>Vista de rutas operativas · Carga masiva desde Excel</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600 }} />
          <button onClick={() => setShowUpload(!showUpload)} style={{
            padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: showUpload ? C.textMuted : C.accent,
            color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            {showUpload ? <><IC.X /> Cancelar</> : <><IC.Download /> Carga masiva</>}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total rutas" value={totalRutas.toString()} icon={<IC.Truck />} color={C.blue} />
        <StatCard label="En curso" value={enCurso.toString()} icon={<IC.Clock />} color={C.yellow} />
        <StatCard label="Completadas" value={completadas.toString()} icon={<IC.Check />} color={C.green} />
        <StatCard label="% Entrega general" value={pctGeneral + "%"} subvalue={`${totalEntregados} / ${totalPaquetes} paquetes`} icon={<IC.BarChart />} color={C.accent} />
      </div>

      {/* Upload area */}
      {showUpload && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 24, border: `2px dashed ${C.accent}`, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: C.text }}>Carga masiva de rutas</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>Sube tu archivo Excel (.xlsx) con las columnas: ID ruta, Carrier, Nombre operador, Total, Entregados, etc.</div>
          <label style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 8,
            backgroundColor: C.accent, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>
            <IC.Download /> Seleccionar archivo Excel
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
          {uploading && <div style={{ marginTop: 12, fontSize: 13, color: C.blue, fontWeight: 600 }}>⏳ Procesando archivo...</div>}
          {uploadMsg && <div style={{ marginTop: 12, fontSize: 13, color: uploadMsg.startsWith("✓") ? C.green : C.red, fontWeight: 600 }}>{uploadMsg}</div>}
          <div style={{ marginTop: 14, fontSize: 11, color: C.textMuted }}>
            Formato esperado: el mismo que genera tu sistema de ruteo (ID ruta, Carrier, Nombre operador, Status, Total, Entregados, Porcentaje de entrega, etc.)
          </div>
        </div>
      )}

      {/* Date + Filter bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
          {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
          <span style={{ marginLeft: 8, fontSize: 12, color: C.textMuted }}>({filtered.length} rutas)</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Todas", "En ruta", "En riesgo", "Completadas"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 16px", borderRadius: 6, border: `1px solid ${filter === f ? C.accent : C.border}`,
              backgroundColor: filter === f ? C.accentLight : C.white, color: filter === f ? C.accent : C.textMuted,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              <th style={{ width: 30, padding: "10px 8px" }}></th>
              <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Empleado</th>
              <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Estatus</th>
              <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Transportista</th>
              <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Tipo de ruta</th>
              <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Intercambios</th>
              <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Fechas</th>
              <th style={{ width: 40, padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted }}>Ver más</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, position: "relative" }}
                onMouseEnter={ev => ev.currentTarget.style.backgroundColor = "#FAFBFF"}
                onMouseLeave={ev => ev.currentTarget.style.backgroundColor = "transparent"}>
                {/* Color bar */}
                <td style={{ padding: 0, position: "relative", width: 4 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: getBarColor(r) }} />
                  <div style={{ paddingLeft: 12 }}>
                    <input type="checkbox" style={{ cursor: "pointer" }} />
                  </div>
                </td>
                {/* Empleado + risk */}
                <td style={{ padding: "14px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.operador}</span>
                    <RiskIcon level={getRisk(r)} />
                  </div>
                </td>
                {/* Estatus with gauge */}
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <CircleGauge value={r.pctEntrega} size={44} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                        {r.entregados} Entregados | {r.intentados} Intentados
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>
                        {r.noVisitados} No visitados | {r.total} Total
                      </div>
                    </div>
                  </div>
                </td>
                {/* Transportista */}
                <td style={{ padding: "14px 12px", fontSize: 12, fontWeight: 600, color: C.text }}>{r.carrier}</td>
                {/* Tipo ruta */}
                <td style={{ padding: "14px 12px", fontSize: 12, color: C.textMuted }}>{r.tipoRuta}</td>
                {/* Intercambios */}
                <td style={{ padding: "14px 12px", fontSize: 13, fontWeight: 600, color: r.intercambios > 0 ? C.blue : C.textMuted }}>
                  {r.intercambios > 0 ? `+ ${r.intercambios}` : "—"}
                </td>
                {/* Fechas */}
                <td style={{ padding: "14px 12px", fontSize: 11, color: C.textMuted }}>
                  {r.salida ? `Desp.: ${r.salida.substring(0, 16)}` : "Sin salida"}
                </td>
                {/* More */}
                <td style={{ padding: "14px 8px", textAlign: "center" }}>
                  <button style={{ padding: 4, border: "none", background: "none", cursor: "pointer", color: C.textMuted, fontSize: 16 }}>•••</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textMuted }}>No hay rutas para mostrar</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Usa "Carga masiva" para importar tu archivo Excel de rutas</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data for rutas (matches the Excel format)
const mockRutas = [
  { idRuta: "2530312", carrier: "FAST INTEGRAL", operador: "Ludwing Yael Miguel Plata", status: "En curso", total: 34, entregados: 30, intentados: 2, noVisitados: 2, pctEntrega: 88.24, salida: "2026-02-26 06:16:41", intercambios: 2, tipoRuta: "Última milla" },
  { idRuta: "2530322", carrier: "FAST INTEGRAL", operador: "Sergio Loeza Diaz", status: "Completada", total: 43, entregados: 37, intentados: 6, noVisitados: 0, pctEntrega: 86.05, salida: "2026-02-26 06:20:00", intercambios: 7, tipoRuta: "Última milla" },
  { idRuta: "2530320", carrier: "KEKO", operador: "Mariana Tapia Rosales", status: "En curso", total: 43, entregados: 29, intentados: 0, noVisitados: 14, pctEntrega: 67.44, salida: "2026-02-26 06:21:02", intercambios: 20, tipoRuta: "Última milla" },
  { idRuta: "2530412", carrier: "FAST INTEGRAL", operador: "Jesus de Israel Colin Tovar", status: "Completada", total: 42, entregados: 36, intentados: 6, noVisitados: 0, pctEntrega: 85.71, salida: "2026-02-26 06:43:53", intercambios: 4, tipoRuta: "Última milla" },
  { idRuta: "2530409", carrier: "ADET", operador: "Juan Pablo Muñoz Moreno", status: "En curso", total: 55, entregados: 48, intentados: 7, noVisitados: 0, pctEntrega: 87.27, salida: "2026-02-26 06:44:59", intercambios: 25, tipoRuta: "Última milla" },
  { idRuta: "2530427", carrier: "KEKO", operador: "Jesús Reyes Santiago", status: "En curso", total: 33, entregados: 25, intentados: 5, noVisitados: 3, pctEntrega: 75.76, salida: "2026-02-26 06:51:33", intercambios: 7, tipoRuta: "Última milla" },
  { idRuta: "2530458", carrier: "FAST INTEGRAL", operador: "MARCO ANTONIO BARBER CASTRO", status: "Completada", total: 34, entregados: 0, intentados: 0, noVisitados: 34, pctEntrega: 0, salida: "2026-02-26 06:54:11", intercambios: 0, tipoRuta: "Última milla" },
  { idRuta: "2530461", carrier: "FAST INTEGRAL", operador: "MARCO ANTONIO BARBER CASTRO", status: "En curso", total: 33, entregados: 10, intentados: 1, noVisitados: 22, pctEntrega: 30.30, salida: "2026-02-26 07:09:00", intercambios: 6, tipoRuta: "Última milla" },
];

// --- UNIDADES ---
function ModuleUnidades() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Unidades</h1>
          <p style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>Gestión de vehículos de flotilla propia</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: C.accent, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <IC.Plus /> Nueva unidad
        </button>
      </div>
      
      {/* Summary cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total unidades" value="6" icon={<IC.Truck />} color={C.blue} />
        <StatCard label="Activas" value="4" subvalue="67%" icon={<IC.Check />} color={C.green} />
        <StatCard label="En mantenimiento" value="1" icon={<IC.Settings />} color={C.yellow} />
        <StatCard label="Baja temporal" value="1" icon={<IC.X />} color={C.red} />
      </div>

      <div style={{ backgroundColor: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["ID", "Tipo", "Placas", "Modelo", "Kilometraje", "Próx. Mantenimiento", "Status", ""].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockUnidades.map((u, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={ev => ev.currentTarget.style.backgroundColor = "#FAFBFF"}
                onMouseLeave={ev => ev.currentTarget.style.backgroundColor = "transparent"}>
                <td style={{ padding: "12px", fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: "monospace" }}>{u.id}</td>
                <td style={{ padding: "12px", fontSize: 13 }}>{u.tipo}</td>
                <td style={{ padding: "12px", fontSize: 13, fontFamily: "monospace" }}>{u.placas}</td>
                <td style={{ padding: "12px", fontSize: 13 }}>{u.modelo}</td>
                <td style={{ padding: "12px", fontSize: 13, fontWeight: 600 }}>{u.km.toLocaleString()} km</td>
                <td style={{ padding: "12px", fontSize: 13, color: C.textMuted }}>{u.proxMantenimiento}</td>
                <td style={{ padding: "12px" }}><StatusBadge status={u.status} /></td>
                <td style={{ padding: "12px" }}>
                  <button style={{ padding: 4, border: "none", background: "none", cursor: "pointer", color: C.textMuted }}><IC.Edit /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- OPERADORES ---
function ModuleOperadores() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Operadores</h1>
          <p style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>Gestión de choferes, licencias y rendimiento</p>
        </div>
        <button style={{ padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: C.accent, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <IC.Plus /> Nuevo operador
        </button>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total operadores" value="5" icon={<IC.Users />} color={C.blue} />
        <StatCard label="Activos" value="4" icon={<IC.Check />} color={C.green} />
        <StatCard label="Promedio % entrega" value="95.2%" icon={<IC.BarChart />} color={C.accent} />
        <StatCard label="Licencias por vencer" value="1" subvalue="Fernando López — May 2026" icon={<IC.Clock />} color={C.yellow} />
      </div>

      <div style={{ backgroundColor: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["ID", "Nombre", "Licencia", "Vencimiento", "Unidad", "Entregas", "% Entrega", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockOperadores.map((o, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={ev => ev.currentTarget.style.backgroundColor = "#FAFBFF"}
                onMouseLeave={ev => ev.currentTarget.style.backgroundColor = "transparent"}>
                <td style={{ padding: "12px", fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: C.accent }}>{o.id}</td>
                <td style={{ padding: "12px", fontSize: 13, fontWeight: 600 }}>{o.nombre}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, backgroundColor: o.licencia === "E" ? C.blueBg : C.yellowBg, color: o.licencia === "E" ? C.blue : C.yellow }}>Tipo {o.licencia}</span>
                </td>
                <td style={{ padding: "12px", fontSize: 13, color: C.textMuted }}>{o.vencimiento}</td>
                <td style={{ padding: "12px", fontSize: 13, fontWeight: 600 }}>{o.unidad}</td>
                <td style={{ padding: "12px", fontSize: 13, fontWeight: 600 }}>{o.entregas.toLocaleString()}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: o.pctEntrega >= 96 ? C.green : o.pctEntrega >= 93 ? C.yellow : C.red }}>{o.pctEntrega}%</span>
                </td>
                <td style={{ padding: "12px" }}><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- COSTOS ---
function ModuleCostos() {
  const [showForm, setShowForm] = useState(false);
  const costos = [
    { fecha: "2026-02-26", unidad: "T1-015", tipo: "Combustible", monto: 3200, litros: 145, km: 620, notas: "Ruta CDMX-GDL" },
    { fecha: "2026-02-25", unidad: "T1-011", tipo: "Mantenimiento", monto: 8500, litros: null, km: null, notas: "Cambio de frenos + balatas" },
    { fecha: "2026-02-25", unidad: "T1-008", tipo: "Combustible", monto: 2800, litros: 127, km: 540, notas: "Ruta CDMX-MTY" },
    { fecha: "2026-02-24", unidad: "T1-022", tipo: "Peajes", monto: 1450, litros: null, km: null, notas: "Casetas CDMX-QRO ida y vuelta" },
    { fecha: "2026-02-24", unidad: "T1-003", tipo: "Combustible", monto: 1900, litros: 86, km: 380, notas: "Ruta CDMX-PUE" },
    { fecha: "2026-02-23", unidad: "T1-015", tipo: "Llantas", monto: 12000, litros: null, km: null, notas: "2 llantas traseras nuevas" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Costos y Gastos</h1>
          <p style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>Registro de combustible, mantenimiento, peajes y más</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: C.accent, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <IC.Plus /> Registrar gasto
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 24, border: `2px solid ${C.accent}`, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: C.accent }}>💰  Registrar nuevo gasto</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
            {[
              { label: "Fecha", type: "date" },
              { label: "Unidad", type: "select" },
              { label: "Tipo gasto", type: "select-tipo" },
              { label: "Monto ($)", type: "number", placeholder: "3200" },
              { label: "Litros (combustible)", type: "number", placeholder: "145" },
              { label: "Kilómetros", type: "number", placeholder: "620" },
              { label: "Factura / Referencia", placeholder: "FACT-001" },
              { label: "Notas", placeholder: "Descripción del gasto" },
            ].map((f, i) => (
              <div key={i}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>{f.label}</label>
                {f.type === "select" ? (
                  <select style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: "border-box" }}>
                    <option>Seleccionar...</option>
                    {mockUnidades.map(u => <option key={u.id}>{u.id}</option>)}
                  </select>
                ) : f.type === "select-tipo" ? (
                  <select style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: "border-box" }}>
                    {["Combustible", "Mantenimiento", "Peajes", "Llantas", "Seguro", "Multas", "Otro"].map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type || "text"} placeholder={f.placeholder} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: "border-box" }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: C.white, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
            <button style={{ padding: "8px 24px", borderRadius: 8, border: "none", backgroundColor: C.green, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✓ Guardar gasto</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <StatCard label="Gasto total Feb" value="$29,850" trend="-5.2%" trendUp subvalue="vs Ene" icon={<IC.Dollar />} color={C.purple} />
        <StatCard label="Combustible" value="$7,900" subvalue="26.5% del total" icon={<IC.Fuel />} color={C.yellow} />
        <StatCard label="Mantenimiento" value="$20,500" subvalue="68.7% del total" icon={<IC.Settings />} color={C.accent} />
        <StatCard label="Costo / km promedio" value="$5.20" trend="-$0.30" trendUp icon={<IC.BarChart />} color={C.green} />
      </div>

      <div style={{ backgroundColor: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["Fecha", "Unidad", "Tipo", "Monto", "Litros", "KM", "$/km", "Notas"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {costos.map((c2, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "12px", fontSize: 12, color: C.textMuted }}>{c2.fecha}</td>
                <td style={{ padding: "12px", fontSize: 13, fontWeight: 600 }}>{c2.unidad}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                    backgroundColor: c2.tipo === "Combustible" ? C.yellowBg : c2.tipo === "Mantenimiento" ? C.blueBg : C.purpleBg,
                    color: c2.tipo === "Combustible" ? C.yellow : c2.tipo === "Mantenimiento" ? C.blue : C.purple
                  }}>{c2.tipo}</span>
                </td>
                <td style={{ padding: "12px", fontSize: 13, fontWeight: 700 }}>${c2.monto.toLocaleString()}</td>
                <td style={{ padding: "12px", fontSize: 12, color: C.textMuted }}>{c2.litros ? `${c2.litros} L` : "—"}</td>
                <td style={{ padding: "12px", fontSize: 12, color: C.textMuted }}>{c2.km ? `${c2.km} km` : "—"}</td>
                <td style={{ padding: "12px", fontSize: 12, fontWeight: 600, color: c2.km ? C.text : C.textMuted }}>{c2.km ? `$${(c2.monto/c2.km).toFixed(1)}` : "—"}</td>
                <td style={{ padding: "12px", fontSize: 12, color: C.textMuted }}>{c2.notas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- OPS Type Module (T1 Envíos, Warehouse, HalfMile, Same Day) ---
function ModuleOpsType({ tipo, color }) {
  const data = opsBreakdown.find(o => o.tipo === tipo) || opsBreakdown[0];
  const enviosFiltrados = mockEnvios.filter(e => e.tipo === tipo);
  
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{tipo}</h1>
          <p style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>KPIs específicos de {tipo}</p>
        </div>
        <select style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, backgroundColor: C.white }}>
          <option>Febrero 2026</option><option>Enero 2026</option><option>Diciembre 2025</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <StatCard label="Envíos" value={data.envios.toLocaleString()} icon={<IC.Package />} color={color} />
        <StatCard label="Entregas" value={data.entregas.toLocaleString()} icon={<IC.Check />} color={C.green} />
        <StatCard label="% Entrega" value={`${data.pct}%`} icon={<IC.BarChart />} color={data.pct >= 96 ? C.green : C.yellow} />
        <StatCard label="Costo" value={`$${(data.costo/1000).toFixed(0)}K`} subvalue={`$${(data.costo/data.envios).toFixed(1)}/envío`} icon={<IC.Dollar />} color={C.purple} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 22, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>% Entrega</div>
          <GaugeChart value={data.pct} label={tipo} size={180} />
        </div>
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 22, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Tendencia de envíos</div>
          <MiniBarChart data={monthlyData.map(d => ({...d, envios: Math.round(d.envios * (data.envios / 30788))}))} dataKey="envios" color={color} />
        </div>
      </div>

      <div style={{ backgroundColor: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700 }}>Envíos recientes — {tipo}</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {["ID", "Fecha", "Operador", "Ruta", "Pqtes", "Status"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enviosFiltrados.length > 0 ? enviosFiltrados.map((e, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 12px", fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: C.accent }}>{e.id}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: C.textMuted }}>{e.fecha}</td>
                <td style={{ padding: "10px 12px", fontSize: 12 }}>{e.operador}</td>
                <td style={{ padding: "10px 12px", fontSize: 12 }}>{e.origen} → {e.destino}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600 }}>{e.paquetes}</td>
                <td style={{ padding: "10px 12px" }}><StatusBadge status={e.status} /></td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: C.textMuted }}>Sin envíos registrados para este filtro</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- PLACEHOLDER ---
function ModulePlaceholder({ title, desc }) {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{title}</h1>
      <p style={{ color: C.textMuted, fontSize: 13, marginTop: 2, marginBottom: 24 }}>{desc}</p>
      <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 48, border: `1px solid ${C.border}`, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Módulo en construcción</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8 }}>Próximamente disponible</div>
      </div>
    </div>
  );
}

// ============ MAIN APP ============

export default function T1OpsFlotilla() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderModule = () => {
    switch (activePage) {
      case "dashboard": return <ModuleDashboard />;
      case "envios": return <ModuleEnvios />;
      case "unidades": return <ModuleUnidades />;
      case "operadores": return <ModuleOperadores />;
      case "costos": return <ModuleCostos />;
      case "t1envios": return <ModuleOpsType tipo="T1 Envíos" color={C.accent} />;
      case "warehouse": return <ModuleOpsType tipo="Warehouse" color={C.blue} />;
      case "halfmile": return <ModuleOpsType tipo="HalfMile" color={C.purple} />;
      case "sameday": return <ModuleOpsType tipo="Same Day" color={C.yellow} />;
      case "config": return <ModulePlaceholder title="Configuración" desc="Ajustes del sistema" />;
      default: return <ModuleDashboard />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", backgroundColor: C.bg, overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarCollapsed ? 60 : 230, backgroundColor: C.sidebar, display: "flex", flexDirection: "column",
        transition: "width 0.2s", flexShrink: 0, overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: sidebarCollapsed ? "16px 12px" : "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, minHeight: 58 }}>
          {!sidebarCollapsed && (
            <>
              <span style={{ fontSize: 22, fontWeight: 900, color: C.accent, letterSpacing: "-0.03em" }}>T1</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "0.04em" }}>ENVÍOS</span>
            </>
          )}
          {sidebarCollapsed && <span style={{ fontSize: 18, fontWeight: 900, color: C.accent, margin: "0 auto" }}>T1</span>}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {navSections.map((section, si) => (
            <div key={si} style={{ marginBottom: 4 }}>
              {!sidebarCollapsed && (
                <div style={{ padding: "10px 20px 4px", fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {section.label}
                </div>
              )}
              {section.items.map(item => {
                const isActive = activePage === item.id;
                return (
                  <button key={item.id} onClick={() => setActivePage(item.id)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: sidebarCollapsed ? "9px 0" : "9px 20px",
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    backgroundColor: isActive ? C.sidebarActive : "transparent",
                    color: isActive ? "white" : "rgba(255,255,255,0.50)",
                    border: "none", cursor: "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400,
                    borderLeft: isActive ? `3px solid ${C.accent}` : "3px solid transparent",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = C.sidebarHover; e.currentTarget.style.color = "white"; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.50)"; }}}>
                    <item.icon />
                    {!sidebarCollapsed && <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>}
                    {!sidebarCollapsed && item.badge && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, backgroundColor: C.accent, color: "white" }}>{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse */}
        <div style={{ padding: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
            width: "100%", padding: 8, borderRadius: 6, border: "none",
            backgroundColor: "transparent", color: "rgba(255,255,255,0.3)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IC.Menu />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <header style={{
          height: 58, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
          backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "7px 14px",
              borderRadius: 8, backgroundColor: C.bg, border: `1px solid ${C.border}`, width: 300,
            }}>
              <IC.Search />
              <input placeholder="Buscar envío, unidad, operador..." style={{
                border: "none", outline: "none", backgroundColor: "transparent", fontSize: 13, width: "100%", color: C.text,
              }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button style={{ position: "relative", padding: 8, borderRadius: 8, border: "none", backgroundColor: "transparent", cursor: "pointer", color: C.textMuted }}>
              <IC.Bell />
              <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", backgroundColor: C.accent }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 800 }}>OPS</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>OPS T1 Envíos</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>Flotilla Propia</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {renderModule()}
        </main>
      </div>
    </div>
  );
}