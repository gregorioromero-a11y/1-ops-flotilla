"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// T1 ENVÍOS — OPS FLOTILLA KPI PLATFORM
// Replaces: Google Sheets (capture) + Looker Studio (dashboard)
// ============================================================

// --- SUPABASE CONFIG ---
const supabase = createClient(
  "https://owhsbmtroxzhscpzozts.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93aHNibXRyb3h6aHNjcHpvenRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTI4NTMsImV4cCI6MjA4ODEyODg1M30.CU1IiseDJnjk8F8L2DaIDbU3UJk1RrRTK61nJe7Oiec"
);

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
    { id: "costos", label: "Registro Diario", icon: IC.Clock },
    { id: "carriers", label: "Carriers / Proveedores", icon: IC.Truck, badge: "Nuevo" },
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
  const [carrierData, setCarrierData] = useState([]);

  useEffect(() => {
    const loadCarrierData = async () => {
      const { data } = await supabase.from("rutas").select("carrier, total, entregados, intentados, no_visitados, pct_entrega");
      if (data && data.length > 0) {
        const grouped = {};
        data.forEach(r => {
          const c = r.carrier || "Sin carrier";
          if (!grouped[c]) grouped[c] = { carrier: c, envios: 0, total: 0, entregados: 0, intentados: 0, noVisitados: 0, rutas: 0 };
          grouped[c].rutas += 1;
          grouped[c].total += (r.total || 0);
          grouped[c].entregados += (r.entregados || 0);
          grouped[c].intentados += (r.intentados || 0);
          grouped[c].noVisitados += (r.no_visitados || 0);
        });
        const arr = Object.values(grouped).map(g => ({
          ...g,
          pctEntrega: g.total > 0 ? ((g.entregados / g.total) * 100).toFixed(1) : 0,
          devoluciones: g.intentados,
          noEntregados: g.total - g.entregados,
        })).sort((a, b) => b.total - a.total);
        setCarrierData(arr);
      }
    };
    loadCarrierData();
  }, []);
  
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

      {/* Desempeño por Proveedor */}
      {carrierData.length > 0 && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 22, border: "1px solid " + C.border, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Desempeño por Proveedor (Carrier)</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Comparativa de métricas operativas por transportista</div>
            </div>
          </div>

          {/* Bar chart - % Entrega */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>% Entrega promedio</div>
            {carrierData.map((c, i) => {
              const pct = parseFloat(c.pctEntrega);
              const color = pct >= 90 ? C.green : pct >= 75 ? C.yellow : C.red;
              const badge = pct >= 90 ? "Excelente" : pct >= 75 ? "Bueno" : "En riesgo";
              const badgeBg = pct >= 90 ? C.greenBg : pct >= 75 ? C.yellowBg : C.redBg;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 130, fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.carrier}</div>
                  <div style={{ flex: 1, height: 22, backgroundColor: "#F3F4F6", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                    <div style={{ width: pct + "%", height: "100%", backgroundColor: color, borderRadius: 6, transition: "width 0.5s", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
                      {pct > 20 && <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{c.pctEntrega}%</span>}
                    </div>
                  </div>
                  {pct <= 20 && <span style={{ fontSize: 10, fontWeight: 700, color }}>{c.pctEntrega}%</span>}
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, backgroundColor: badgeBg, color, minWidth: 60, textAlign: "center" }}>{badge}</span>
                </div>
              );
            })}
          </div>

          {/* Bar chart - Total envíos */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Total de paquetes</div>
            {(() => {
              const maxTotal = Math.max(...carrierData.map(c => c.total));
              return carrierData.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 130, fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.carrier}</div>
                  <div style={{ flex: 1, height: 22, backgroundColor: "#F3F4F6", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ display: "flex", height: "100%", borderRadius: 6 }}>
                      <div style={{ width: (c.entregados / maxTotal * 100) + "%", backgroundColor: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {c.entregados > maxTotal * 0.15 && <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>{c.entregados}</span>}
                      </div>
                      <div style={{ width: (c.noEntregados / maxTotal * 100) + "%", backgroundColor: C.red, opacity: 0.7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {c.noEntregados > maxTotal * 0.1 && <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>{c.noEntregados}</span>}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.text, minWidth: 40, textAlign: "right" }}>{c.total}</span>
                </div>
              ));
            })()}
            <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: C.green }} /><span style={{ fontSize: 10, color: C.textMuted }}>Entregados</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: C.red, opacity: 0.7 }} /><span style={{ fontSize: 10, color: C.textMuted }}>No entregados</span></div>
            </div>
          </div>

          {/* Bar chart - Devoluciones / Intentados */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Devoluciones (intentos fallidos)</div>
            {(() => {
              const maxDev = Math.max(...carrierData.map(c => c.devoluciones), 1);
              return carrierData.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 130, fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.carrier}</div>
                  <div style={{ flex: 1, height: 22, backgroundColor: "#F3F4F6", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: (c.devoluciones / maxDev * 100) + "%", height: "100%", backgroundColor: "#F59E0B", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
                      {c.devoluciones > maxDev * 0.15 && <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{c.devoluciones}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.yellow, minWidth: 30, textAlign: "right" }}>{c.devoluciones}</span>
                </div>
              ));
            })()}
          </div>

          {/* Summary table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid " + C.border }}>
                {["Carrier", "Rutas", "Paquetes", "Entregados", "No entregados", "Devoluciones", "% Entrega", "Desempeño"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {carrierData.map((c, i) => {
                const pct = parseFloat(c.pctEntrega);
                const color = pct >= 90 ? C.green : pct >= 75 ? C.yellow : C.red;
                const badge = pct >= 90 ? "Excelente" : pct >= 75 ? "Bueno" : "En riesgo";
                const badgeBg = pct >= 90 ? C.greenBg : pct >= 75 ? C.yellowBg : C.redBg;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid " + C.border }}>
                    <td style={{ padding: "10px", fontSize: 13, fontWeight: 600 }}>{c.carrier}</td>
                    <td style={{ padding: "10px", fontSize: 13 }}>{c.rutas}</td>
                    <td style={{ padding: "10px", fontSize: 13, fontWeight: 600 }}>{c.total.toLocaleString()}</td>
                    <td style={{ padding: "10px", fontSize: 13, color: C.green, fontWeight: 600 }}>{c.entregados.toLocaleString()}</td>
                    <td style={{ padding: "10px", fontSize: 13, color: C.red }}>{c.noEntregados.toLocaleString()}</td>
                    <td style={{ padding: "10px", fontSize: 13, color: C.yellow, fontWeight: 600 }}>{c.devoluciones}</td>
                    <td style={{ padding: "10px", fontSize: 13, fontWeight: 700, color }}>{c.pctEntrega}%</td>
                    <td style={{ padding: "10px" }}><span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, backgroundColor: badgeBg, color }}>{badge}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
  const [rutas, setRutas] = useState([]);
  const [filter, setFilter] = useState("Todas");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [fechaDesde, setFechaDesde] = useState("2026-02-26");
  const [fechaHasta, setFechaHasta] = useState("2026-02-26");
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [costosData, setCostosData] = useState([]);

  // Load rutas and costos when date changes
  useEffect(() => { loadRutas(); loadCostos(); }, [fechaDesde, fechaHasta]);

  const loadCostos = async () => {
    const { data } = await supabase.from("costos").select("*").gte("fecha", fechaDesde).lte("fecha", fechaHasta);
    setCostosData(data || []);
  };

  const loadRutas = async () => {
    setLoading(true);
    const { data } = await supabase.from("rutas").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      const filtered_by_date = data.filter(r => {
        const salida = r.fecha_salida || r.fecha_registro || "";
        const fecha = salida.substring(0, 10);
        return fecha >= fechaDesde && fecha <= fechaHasta;
      });
      const source = filtered_by_date.length > 0 ? filtered_by_date : [];
      setRutas(source.map(r => ({
        id: r.id, idRuta: r.id_ruta, carrier: r.carrier || "—", operador: r.operador || "Sin nombre",
        correo: r.correo_operador || "", placa: r.placa || "", almacen: r.almacen || "T1 ENVIOS",
        economico: r.economico || "", status: r.status || "En curso", total: r.total || 0,
        entregados: r.entregados || 0, recolecciones: r.recolecciones || 0,
        pctEntrega: parseFloat(r.pct_entrega) || 0, intentados: r.intentados || 0,
        noVisitados: r.no_visitados || 0, salida: r.fecha_salida || "",
        intercambios: r.intercambios || 0, tipoRuta: r.tipo_ruta || "Última milla",
        kmEstimados: r.km_estimados || "—", kmRecorridos: r.km_recorridos || "—",
        tiempoEstimado: r.tiempo_estimado || "—", tiempoReal: r.tiempo_real || "—",
      })));
    } else {
      setRutas([]);
    }
    setLoading(false);
  };

  const updateRuta = async (index, field, value) => {
    const updated = [...rutas];
    updated[index] = { ...updated[index], [field]: value };
    setRutas(updated);
    const r = updated[index];
    if (r.id) {
      const dbField = field === "tipoRuta" ? "tipo_ruta" : field;
      await supabase.from("rutas").update({ [dbField]: value }).eq("id", r.id);
    }
  };

  const deleteRuta = async (index) => {
    const r = rutas[index];
    if (r.id) { await supabase.from("rutas").delete().eq("id", r.id); }
    setRutas(rutas.filter((_, i) => i !== index));
    setOpenMenu(null);
  };

  const toggleRow = (idx) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === filtered.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filtered.map((_, i) => i)));
    }
  };

  const bulkUpdateTipo = async (tipo) => {
    const updated = [...rutas];
    for (const idx of selectedRows) {
      const r = filtered[idx];
      const realIdx = rutas.indexOf(r);
      if (realIdx >= 0) {
        updated[realIdx] = { ...updated[realIdx], tipoRuta: tipo };
        if (r.id) {
          await supabase.from("rutas").update({ tipo_ruta: tipo }).eq("id", r.id);
        }
      }
    }
    setRutas(updated);
    setSelectedRows(new Set());
  };

  const bulkDelete = async () => {
    if (!confirm("¿Eliminar " + selectedRows.size + " rutas seleccionadas?")) return;
    const toDelete = [...selectedRows].map(idx => filtered[idx]);
    for (const r of toDelete) {
      if (r.id) { await supabase.from("rutas").delete().eq("id", r.id); }
    }
    setRutas(rutas.filter(r => !toDelete.includes(r)));
    setSelectedRows(new Set());
  };

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

  // Cost calculations from costos table
  const costoTotalPeriodo = costosData.reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);
  const costoUM = costosData.filter(r => r.tipo === "Última milla").reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);
  const costoHM = costosData.filter(r => r.tipo === "Half mile").reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);
  const costoPorPaquete = totalEntregados > 0 ? (costoTotalPeriodo / totalEntregados).toFixed(2) : 0;

  // Cost by carrier
  const costosPorCarrier = {};
  costosData.forEach(c => {
    const prov = (c.unidad || "").split(" - ")[0] || "Sin carrier";
    if (!costosPorCarrier[prov]) costosPorCarrier[prov] = { carrier: prov, costo: 0, unidades: 0, costoUM: 0, costoHM: 0 };
    costosPorCarrier[prov].costo += (parseFloat(c.monto) || 0);
    costosPorCarrier[prov].unidades += (parseInt(c.litros) || 0);
    if (c.tipo === "Última milla") costosPorCarrier[prov].costoUM += (parseFloat(c.monto) || 0);
    if (c.tipo === "Half mile") costosPorCarrier[prov].costoHM += (parseFloat(c.monto) || 0);
  });
  // Add paquetes from rutas
  rutas.forEach(r => {
    const prov = r.carrier || "Sin carrier";
    if (costosPorCarrier[prov]) {
      costosPorCarrier[prov].entregados = (costosPorCarrier[prov].entregados || 0) + r.entregados;
      costosPorCarrier[prov].total = (costosPorCarrier[prov].total || 0) + r.total;
    }
  });
  const carrierCostList = Object.values(costosPorCarrier).sort((a, b) => b.costo - a.costo);

  // ===== FIXED: Use XLSX directly from npm import instead of dynamic CDN import =====
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import("xlsx");
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

        // Auto-adjust date range to cover all uploaded dates
        const fechas = parsed.map(r => (r.salida || "").substring(0, 10)).filter(f => f.length === 10).sort();
        if (fechas.length > 0) {
          setFechaDesde(fechas[0]);
          setFechaHasta(fechas[fechas.length - 1]);
        }

        // Save to Supabase
        const dbRows = parsed.map(r => ({
          id_ruta: r.idRuta, carrier: r.carrier, operador: r.operador,
          correo_operador: r.correo, placa: r.placa, almacen: r.almacen,
          economico: r.economico, status: r.status, total: r.total,
          entregados: r.entregados, recolecciones: r.recolecciones,
          pct_entrega: r.pctEntrega, intentados: r.intentados,
          no_visitados: r.noVisitados, fecha_salida: r.salida || null,
          intercambios: r.intercambios, tipo_ruta: r.tipoRuta,
          km_estimados: r.kmEstimados, km_recorridos: r.kmRecorridos,
          tiempo_estimado: r.tiempoEstimado, tiempo_real: r.tiempoReal,
          fecha_registro: (r.salida || "").substring(0, 10) || fechaDesde,
        }));
        const { error } = await supabase.from("rutas").insert(dbRows);
        if (error) {
          console.error("Supabase insert error:", error);
          setUploadMsg(`✓ ${parsed.length} rutas cargadas (error al guardar en BD: ${error.message})`);
        } else {
          loadRutas();
        }
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
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="date" value={fechaDesde} onChange={e => { setFechaDesde(e.target.value); if (e.target.value > fechaHasta) setFechaHasta(e.target.value); }} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600 }} />
            <span style={{ fontSize: 12, color: C.textMuted }}>al</span>
            <input type="date" value={fechaHasta} onChange={e => { if (e.target.value >= fechaDesde) setFechaHasta(e.target.value); }} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600 }} />
          </div>
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

      {/* Cost StatCards */}
      {costoTotalPeriodo > 0 && (
        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          <StatCard label="Costo total periodo" value={"$" + (costoTotalPeriodo >= 1000000 ? (costoTotalPeriodo/1000000).toFixed(2) + "M" : costoTotalPeriodo >= 1000 ? (costoTotalPeriodo/1000).toFixed(0) + "K" : costoTotalPeriodo.toLocaleString())} icon={<IC.Dollar />} color={C.purple} />
          <StatCard label="Costo / paquete" value={"$" + costoPorPaquete} subvalue={totalEntregados + " paquetes entregados"} icon={<IC.Package />} color={C.accent} />
          <StatCard label="Última milla" value={"$" + (costoUM >= 1000 ? (costoUM/1000).toFixed(0) + "K" : costoUM.toLocaleString())} subvalue={costoTotalPeriodo > 0 ? ((costoUM/costoTotalPeriodo*100).toFixed(0) + "% del total") : ""} icon={<IC.Truck />} color={C.green} />
          <StatCard label="Half mile" value={"$" + (costoHM >= 1000 ? (costoHM/1000).toFixed(0) + "K" : costoHM.toLocaleString())} subvalue={costoTotalPeriodo > 0 ? ((costoHM/costoTotalPeriodo*100).toFixed(0) + "% del total") : ""} icon={<IC.Map />} color={C.blue} />
        </div>
      )}

      {/* Cost by carrier table */}
      {carrierCostList.length > 0 && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, border: "1px solid " + C.border, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid " + C.border, fontSize: 13, fontWeight: 700, color: C.text }}>Costo por Carrier — Periodo seleccionado</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid " + C.border }}>
                {["Carrier", "Unidades", "Costo ÚM", "Costo HM", "Costo Total", "Pqtes Entregados", "Costo/Paquete"].map(h => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {carrierCostList.map((cc, i) => {
                const cppq = (cc.entregados || 0) > 0 ? (cc.costo / cc.entregados).toFixed(2) : "—";
                return (
                  <tr key={i} style={{ borderBottom: "1px solid " + C.border }}>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{cc.carrier}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13 }}>{cc.unidades}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: C.green, fontWeight: 600 }}>${cc.costoUM.toLocaleString()}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: C.blue, fontWeight: 600 }}>${cc.costoHM.toLocaleString()}</td>
                    <td style={{ padding: "10px 14px", fontSize: 14, fontWeight: 700 }}>${cc.costo.toLocaleString()}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13 }}>{cc.entregados || 0}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, color: C.accent }}>{typeof cppq === "string" ? cppq : "$" + cppq}</td>
                  </tr>
                );
              })}
              <tr style={{ backgroundColor: "#FAFBFF", borderTop: "2px solid " + C.border }}>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 800 }}>TOTAL</td>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700 }}>{carrierCostList.reduce((s, c) => s + c.unidades, 0)}</td>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, color: C.green }}>${costoUM.toLocaleString()}</td>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, color: C.blue }}>${costoHM.toLocaleString()}</td>
                <td style={{ padding: "10px 14px", fontSize: 14, fontWeight: 800 }}>${costoTotalPeriodo.toLocaleString()}</td>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700 }}>{totalEntregados}</td>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 800, color: C.accent }}>${costoPorPaquete}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

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
          {fechaDesde === fechaHasta
            ? new Date(fechaDesde + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
            : new Date(fechaDesde + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" }) + " — " + new Date(fechaHasta + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
          }
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

      {/* Bulk action bar */}
      {selectedRows.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", marginBottom: 12, backgroundColor: C.accentLight, borderRadius: 10, border: "1px solid " + C.accent }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{selectedRows.size} seleccionada{selectedRows.size > 1 ? "s" : ""}</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>Tipo de ruta:</span>
          <button onClick={() => bulkUpdateTipo("Última milla")} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid " + C.border, backgroundColor: C.white, fontSize: 12, fontWeight: 600, cursor: "pointer", color: C.text }}>Última milla</button>
          <button onClick={() => bulkUpdateTipo("Half mile")} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid " + C.border, backgroundColor: C.white, fontSize: 12, fontWeight: 600, cursor: "pointer", color: C.text }}>Half mile</button>
          <button onClick={() => bulkUpdateTipo("Same Day")} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid " + C.border, backgroundColor: C.white, fontSize: 12, fontWeight: 600, cursor: "pointer", color: C.text }}>Same Day</button>
          <div style={{ width: 1, height: 24, backgroundColor: C.border, margin: "0 4px" }} />
          <button onClick={bulkDelete} style={{ padding: "5px 14px", borderRadius: 6, border: "none", backgroundColor: C.red, color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>Eliminar</button>
          <button onClick={() => setSelectedRows(new Set())} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid " + C.border, backgroundColor: C.white, fontSize: 12, cursor: "pointer", color: C.textMuted }}>✕</button>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              <th style={{ width: 30, padding: "10px 8px" }}>
                <input type="checkbox" checked={selectedRows.size === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ cursor: "pointer", accentColor: C.accent }} />
              </th>
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
                    <input type="checkbox" checked={selectedRows.has(i)} onChange={() => toggleRow(i)} style={{ cursor: "pointer", accentColor: C.accent }} />
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
                {/* Tipo ruta - editable dropdown */}
                <td style={{ padding: "10px 12px" }}>
                  <select value={r.tipoRuta} onChange={e => updateRuta(rutas.indexOf(r), "tipoRuta", e.target.value)} style={{
                    fontSize: 12, padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, backgroundColor: C.white, color: C.text, cursor: "pointer", fontWeight: 500,
                  }}>
                    <option value="Última milla">Última milla</option>
                    <option value="Half mile">Half mile</option>
                  </select>
                </td>
                {/* Intercambios */}
                <td style={{ padding: "14px 12px", fontSize: 13, fontWeight: 600, color: r.intercambios > 0 ? C.blue : C.textMuted }}>
                  {r.intercambios > 0 ? `+ ${r.intercambios}` : "—"}
                </td>
                {/* Fechas */}
                <td style={{ padding: "14px 12px", fontSize: 11, color: C.textMuted }}>
                  {r.salida ? `Desp.: ${r.salida.substring(0, 16)}` : "Sin salida"}
                </td>
                {/* More - action menu */}
                <td style={{ padding: "14px 8px", textAlign: "center", position: "relative" }}>
                  <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === i ? null : i); }} style={{ padding: 4, border: "none", background: "none", cursor: "pointer", color: C.textMuted, fontSize: 16 }}>•••</button>
                  {openMenu === i && (
                    <div style={{
                      position: "absolute", right: 12, top: 40, backgroundColor: C.white, borderRadius: 8,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)", border: `1px solid ${C.border}`, zIndex: 100, minWidth: 140, overflow: "hidden",
                    }}>
                      <button onClick={() => { setOpenMenu(null); /* edit logic */ }} style={{
                        width: "100%", padding: "10px 16px", border: "none", backgroundColor: "transparent", cursor: "pointer",
                        fontSize: 12, fontWeight: 600, color: C.text, textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                      }}
                      onMouseEnter={ev => ev.currentTarget.style.backgroundColor = C.bg}
                      onMouseLeave={ev => ev.currentTarget.style.backgroundColor = "transparent"}>
                        <IC.Edit /> Editar
                      </button>
                      <button onClick={() => deleteRuta(rutas.indexOf(r))} style={{
                        width: "100%", padding: "10px 16px", border: "none", backgroundColor: "transparent", cursor: "pointer",
                        fontSize: 12, fontWeight: 600, color: C.red, textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                      }}
                      onMouseEnter={ev => ev.currentTarget.style.backgroundColor = C.redBg}
                      onMouseLeave={ev => ev.currentTarget.style.backgroundColor = "transparent"}>
                        <IC.Trash /> Eliminar
                      </button>
                    </div>
                  )}
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
  const [registros, setRegistros] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fecha: new Date().toISOString().split("T")[0], proveedor: "" });
  const [lineas, setLineas] = useState([{ tipo_unidad: "", operacion: "Última milla", cantidad: "1" }]);
  const [filtroDesde, setFiltroDesde] = useState(new Date().toISOString().split("T")[0]);
  const [filtroHasta, setFiltroHasta] = useState(new Date().toISOString().split("T")[0]);
  const [filtroProv, setFiltroProv] = useState("Todos");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: costosData }, { data: carriersData }] = await Promise.all([
      supabase.from("costos").select("*").order("fecha", { ascending: false }),
      supabase.from("carriers").select("*").order("proveedor")
    ]);
    setRegistros(costosData || []);
    setCarriers((carriersData || []).filter(c => c.tipo_unidad !== "—"));
    setLoading(false);
  };

  // Get unique proveedores from carriers
  const proveedores = [...new Set(carriers.map(c => c.proveedor))];

  // Get tipos for selected proveedor
  const tiposDisponibles = carriers.filter(c => c.proveedor === form.proveedor);

  // Calculate totals for all lines
  const getCarrierForLine = (line) => carriers.find(c => c.proveedor === form.proveedor && c.tipo_unidad === line.tipo_unidad);
  const getCostoLine = (line) => {
    const carr = getCarrierForLine(line);
    return (carr ? parseFloat(carr.costo_unidad) : 0) * (parseInt(line.cantidad) || 0);
  };
  const costoTotalForm = lineas.reduce((s, l) => s + getCostoLine(l), 0);
  const allLinesValid = form.proveedor && lineas.every(l => l.tipo_unidad && l.cantidad);

  const [saveMsg, setSaveMsg] = useState("");

  const addLinea = () => {
    setLineas([...lineas, { tipo_unidad: "", operacion: "Última milla", cantidad: "1" }]);
  };

  const removeLinea = (idx) => {
    if (lineas.length <= 1) return;
    setLineas(lineas.filter((_, i) => i !== idx));
  };

  const updateLinea = (idx, field, value) => {
    const updated = [...lineas];
    updated[idx] = { ...updated[idx], [field]: value };
    setLineas(updated);
  };

  const saveRegistro = async () => {
    if (!allLinesValid) return;
    setSaveMsg("");
    const rows = lineas.map(l => {
      const carr = getCarrierForLine(l);
      const costoUnit = carr ? parseFloat(carr.costo_unidad) : 0;
      const cant = parseInt(l.cantidad) || 0;
      return {
        fecha: form.fecha,
        unidad: form.proveedor + " - " + l.tipo_unidad,
        tipo: l.operacion,
        monto: costoUnit * cant,
        litros: cant,
        km: costoUnit,
        factura: null,
        notas: cant + " unidades x $" + costoUnit.toLocaleString() + "/unidad"
      };
    });
    const { error } = await supabase.from("costos").insert(rows);
    if (error) {
      console.error("Supabase error:", error);
      setSaveMsg("Error: " + error.message);
      return;
    }
    setSaveMsg("✓ " + rows.length + " registros guardados");
    setForm({ fecha: form.fecha, proveedor: "" });
    setLineas([{ tipo_unidad: "", operacion: "Última milla", cantidad: "1" }]);
    loadData();
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const deleteRegistro = async (id) => {
    if (!confirm("¿Eliminar este registro?")) return;
    await supabase.from("costos").delete().eq("id", id);
    loadData();
  };

  // Filter by date range and proveedor
  const registrosFiltrados = registros.filter(r => {
    const fecha = (r.fecha || "").substring(0, 10);
    if (fecha < filtroDesde || fecha > filtroHasta) return false;
    if (filtroProv !== "Todos") {
      const prov = (r.unidad || "").split(" - ")[0];
      if (prov !== filtroProv) return false;
    }
    return true;
  });

  // Get unique proveedores from registros
  const proveedoresRegistro = [...new Set(registros.map(r => (r.unidad || "").split(" - ")[0]).filter(p => p))];

  // Summary: units per day per proveedor
  const resumenDiario = {};
  registrosFiltrados.forEach(r => {
    const fecha = (r.fecha || "").substring(0, 10);
    const prov = (r.unidad || "").split(" - ")[0];
    const key = fecha + "|" + prov;
    if (!resumenDiario[key]) resumenDiario[key] = { fecha, proveedor: prov, unidades: 0, costoUM: 0, costoHM: 0, costo: 0 };
    resumenDiario[key].unidades += (parseInt(r.litros) || 0);
    resumenDiario[key].costo += (parseFloat(r.monto) || 0);
    if (r.tipo === "Última milla") resumenDiario[key].costoUM += (parseFloat(r.monto) || 0);
    if (r.tipo === "Half mile") resumenDiario[key].costoHM += (parseFloat(r.monto) || 0);
  });
  const resumenList = Object.values(resumenDiario).sort((a, b) => a.fecha > b.fecha ? -1 : a.fecha < b.fecha ? 1 : a.proveedor.localeCompare(b.proveedor));

  // Totals from filtered
  const totalGasto = registrosFiltrados.reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);
  const totalUM = registrosFiltrados.filter(r => r.tipo === "Última milla").reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);
  const totalHM = registrosFiltrados.filter(r => r.tipo === "Half mile").reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);
  const totalUnidades = registrosFiltrados.reduce((s, r) => s + (parseInt(r.litros) || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Registro Diario</h1>
          <p style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>Registro de unidades operativas por día · Costos desde catálogo de carriers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: showForm ? C.textMuted : C.accent, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          {showForm ? <><IC.X /> Cancelar</> : <><IC.Plus /> Registrar día</>}
        </button>
      </div>

      {/* Date filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted }}>Periodo:</span>
        <input type="date" value={filtroDesde} onChange={e => { setFiltroDesde(e.target.value); if (e.target.value > filtroHasta) setFiltroHasta(e.target.value); }} style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600 }} />
        <span style={{ fontSize: 12, color: C.textMuted }}>al</span>
        <input type="date" value={filtroHasta} onChange={e => { if (e.target.value >= filtroDesde) setFiltroHasta(e.target.value); }} style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600 }} />
        <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 4 }}>
          {filtroDesde === filtroHasta
            ? new Date(filtroDesde + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
            : new Date(filtroDesde + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" }) + " — " + new Date(filtroHasta + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
          }
        </span>
        <div style={{ width: 1, height: 20, backgroundColor: C.border, margin: "0 4px" }} />
        <select value={filtroProv} onChange={e => setFiltroProv(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer" }}>
          <option value="Todos">Todos los proveedores</option>
          {proveedoresRegistro.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {filtroProv !== "Todos" && (
          <button onClick={() => setFiltroProv("Todos")} style={{ padding: "5px 10px", borderRadius: 6, border: "none", backgroundColor: C.redBg, color: C.red, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Limpiar</button>
        )}
      </div>

      {/* StatCards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <StatCard label="Gasto total" value={"$" + (totalGasto >= 1000000 ? (totalGasto/1000000).toFixed(2) + "M" : totalGasto >= 1000 ? (totalGasto/1000).toFixed(0) + "K" : totalGasto.toLocaleString())} icon={<IC.Dollar />} color={C.purple} />
        <StatCard label="Última milla" value={"$" + (totalUM >= 1000 ? (totalUM/1000).toFixed(0) + "K" : totalUM.toLocaleString())} subvalue={((totalGasto > 0 ? (totalUM/totalGasto*100).toFixed(0) : 0)) + "% del total"} icon={<IC.Package />} color={C.green} />
        <StatCard label="Half mile" value={"$" + (totalHM >= 1000 ? (totalHM/1000).toFixed(0) + "K" : totalHM.toLocaleString())} subvalue={((totalGasto > 0 ? (totalHM/totalGasto*100).toFixed(0) : 0)) + "% del total"} icon={<IC.Map />} color={C.accent} />
        <StatCard label="Unidades registradas" value={totalUnidades.toString()} subvalue={registros.length + " registros"} icon={<IC.Truck />} color={C.blue} />
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 24, border: "2px solid " + C.accent, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: C.accent }}>💰 Registro diario de unidades</div>
          {/* Fecha + Proveedor */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Proveedor</label>
              <select value={form.proveedor} onChange={e => { setForm({...form, proveedor: e.target.value}); setLineas([{ tipo_unidad: "", operacion: "Última milla", cantidad: "1" }]); }} style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 13, boxSizing: "border-box" }}>
                <option value="">Seleccionar proveedor...</option>
                {proveedores.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Lines */}
          {form.proveedor && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.7fr 40px", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted }}>TIPO DE UNIDAD</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted }}>OPERACIÓN</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted }}>CANT.</span>
                <span></span>
              </div>
              {lineas.map((l, idx) => {
                const carr = getCarrierForLine(l);
                const costoLine = getCostoLine(l);
                return (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.7fr 40px", gap: 10, marginBottom: 8, alignItems: "center" }}>
                    <select value={l.tipo_unidad} onChange={e => updateLinea(idx, "tipo_unidad", e.target.value)} style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, boxSizing: "border-box" }}>
                      <option value="">Seleccionar tipo...</option>
                      {tiposDisponibles.map(c => <option key={c.id} value={c.tipo_unidad}>{c.tipo_unidad} — ${parseFloat(c.costo_unidad).toLocaleString()}/día</option>)}
                    </select>
                    <select value={l.operacion} onChange={e => updateLinea(idx, "operacion", e.target.value)} style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, boxSizing: "border-box" }}>
                      <option value="Última milla">Última milla</option>
                      <option value="Half mile">Half mile</option>
                    </select>
                    <input type="number" min="1" value={l.cantidad} onChange={e => updateLinea(idx, "cantidad", e.target.value)} style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, boxSizing: "border-box" }} />
                    {lineas.length > 1 ? (
                      <button onClick={() => removeLinea(idx)} style={{ padding: 4, border: "none", backgroundColor: C.redBg, borderRadius: 4, cursor: "pointer", color: C.red, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}><IC.X /></button>
                    ) : <div />}
                  </div>
                );
              })}
              <button onClick={addLinea} style={{ padding: "6px 14px", borderRadius: 6, border: "1px dashed " + C.accent, backgroundColor: "transparent", color: C.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}><IC.Plus /> Agregar otro tipo de unidad</button>
            </div>
          )}

          {/* Cost preview */}
          {costoTotalForm > 0 && (
            <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 8, backgroundColor: "#F0FDF4", border: "1px solid " + C.green + "40" }}>
              {lineas.filter(l => l.tipo_unidad).map((l, idx) => {
                const carr = getCarrierForLine(l);
                const costoUnit = carr ? parseFloat(carr.costo_unidad) : 0;
                const cant = parseInt(l.cantidad) || 0;
                return (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text, marginBottom: 4 }}>
                    <span>{l.tipo_unidad} ({l.operacion}) — {cant} unid. × ${costoUnit.toLocaleString()}</span>
                    <span style={{ fontWeight: 700 }}>${(costoUnit * cant).toLocaleString()}</span>
                  </div>
                );
              })}
              <div style={{ borderTop: "1px solid " + C.green + "30", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: C.textMuted }}>Costo total del día</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: C.green }}>${costoTotalForm.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid " + C.border, backgroundColor: C.white, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
            <button onClick={saveRegistro} disabled={!allLinesValid} style={{ padding: "8px 24px", borderRadius: 8, border: "none", backgroundColor: allLinesValid ? C.green : C.border, color: "white", fontSize: 13, fontWeight: 700, cursor: allLinesValid ? "pointer" : "default" }}>✓ Registrar {lineas.filter(l => l.tipo_unidad).length > 1 ? "(" + lineas.filter(l => l.tipo_unidad).length + " líneas)" : ""}</button>
          </div>
          {saveMsg && <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: saveMsg.startsWith("✓") ? C.green : C.red }}>{saveMsg}</div>}
        </div>
      )}

      {/* Summary table - units per day per proveedor */}
      {resumenList.length > 0 && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, border: "1px solid " + C.border, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid " + C.border, fontSize: 13, fontWeight: 700, color: C.text }}>Resumen por día por proveedor</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid " + C.border }}>
                {["Fecha", "Proveedor", "Unidades", "Costo ÚM", "Costo HM", "Costo Total"].map(h => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resumenList.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid " + C.border }}
                  onMouseEnter={ev => ev.currentTarget.style.backgroundColor = "#FAFBFF"}
                  onMouseLeave={ev => ev.currentTarget.style.backgroundColor = "transparent"}>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: C.textMuted }}>{r.fecha}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{r.proveedor}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700 }}>{r.unidades}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: C.green, fontWeight: 600 }}>{r.costoUM > 0 ? "$" + r.costoUM.toLocaleString() : "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: C.blue, fontWeight: 600 }}>{r.costoHM > 0 ? "$" + r.costoHM.toLocaleString() : "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 14, fontWeight: 700 }}>${r.costo.toLocaleString()}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: "#FAFBFF", borderTop: "2px solid " + C.border }}>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 800 }} colSpan={2}>TOTAL</td>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 800 }}>{resumenList.reduce((s, r) => s + r.unidades, 0)}</td>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 800, color: C.green }}>${resumenList.reduce((s, r) => s + r.costoUM, 0).toLocaleString()}</td>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 800, color: C.blue }}>${resumenList.reduce((s, r) => s + r.costoHM, 0).toLocaleString()}</td>
                <td style={{ padding: "10px 14px", fontSize: 14, fontWeight: 800 }}>${resumenList.reduce((s, r) => s + r.costo, 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Detail table */}
      <div style={{ backgroundColor: C.white, borderRadius: 12, border: "1px solid " + C.border, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid " + C.border, fontSize: 13, fontWeight: 700, color: C.text }}>Detalle de registros</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid " + C.border }}>
              {["Fecha", "Proveedor / Tipo", "Operación", "Unidades", "Costo/Unidad", "Costo Total", ""].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid " + C.border }}
                onMouseEnter={ev => ev.currentTarget.style.backgroundColor = "#FAFBFF"}
                onMouseLeave={ev => ev.currentTarget.style.backgroundColor = "transparent"}>
                <td style={{ padding: "12px 14px", fontSize: 12, color: C.textMuted }}>{r.fecha}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>{r.unidad}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, backgroundColor: r.tipo === "Última milla" ? C.greenBg : r.tipo === "Half mile" ? C.accentLight : C.yellowBg, color: r.tipo === "Última milla" ? C.green : r.tipo === "Half mile" ? C.accent : C.yellow }}>{r.tipo}</span>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>{r.litros || "—"}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: C.textMuted }}>{r.km ? "$" + parseFloat(r.km).toLocaleString() : "—"}</td>
                <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 700, color: C.text }}>${(parseFloat(r.monto) || 0).toLocaleString()}</td>
                <td style={{ padding: "12px 14px" }}>
                  <button onClick={() => deleteRegistro(r.id)} style={{ padding: "4px 8px", borderRadius: 4, border: "none", backgroundColor: C.redBg, cursor: "pointer", color: C.red, fontSize: 11 }}><IC.Trash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {registrosFiltrados.length === 0 && (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>��</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textMuted }}>No hay registros de costos</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Usa "Registrar día" para capturar unidades por proveedor</div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- CARRIERS / PROVEEDORES ---
function ModuleCarriers() {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewCarrier, setShowNewCarrier] = useState(false);
  const [newCarrierName, setNewCarrierName] = useState("");
  const [addingUnitTo, setAddingUnitTo] = useState(null);
  const [unitForm, setUnitForm] = useState({ tipo_unidad: "Sedan", operacion: "Última milla", costo_unidad: "" });
  const [editId, setEditId] = useState(null);
  const [filterOp, setFilterOp] = useState("Todas");
  const [filterProv, setFilterProv] = useState("Todos");

  const TIPOS_UNIDAD = ["Moto", "Sedan", "SmallVan", "Van", "LargeVan", "5 Ton", "Rabon", "Torton", "Tracto"];

  useEffect(() => { loadCarriers(); }, []);

  const loadCarriers = async () => {
    setLoading(true);
    const { data } = await supabase.from("carriers").select("*").order("proveedor", { ascending: true });
    setCarriers(data || []);
    setLoading(false);
  };

  const createCarrier = async () => {
    if (!newCarrierName.trim()) return;
    await supabase.from("carriers").insert([{ proveedor: newCarrierName.trim().toUpperCase(), tipo_unidad: "---", operacion: "---", costo_unidad: 0 }]);
    setNewCarrierName("");
    setShowNewCarrier(false);
    loadCarriers();
  };

  const addUnit = async (proveedor) => {
    if (!unitForm.costo_unidad) return;
    if (editId) {
      await supabase.from("carriers").update({ tipo_unidad: unitForm.tipo_unidad, operacion: unitForm.operacion, costo_unidad: parseFloat(unitForm.costo_unidad) }).eq("id", editId);
    } else {
      await supabase.from("carriers").insert([{ proveedor, tipo_unidad: unitForm.tipo_unidad, operacion: unitForm.operacion, costo_unidad: parseFloat(unitForm.costo_unidad) }]);
    }
    setUnitForm({ tipo_unidad: "Sedan", operacion: "Última milla", costo_unidad: "" });
    setAddingUnitTo(null);
    setEditId(null);
    loadCarriers();
  };

  const editUnit = (c) => {
    setUnitForm({ tipo_unidad: c.tipo_unidad, operacion: c.operacion || "Última milla", costo_unidad: c.costo_unidad.toString() });
    setEditId(c.id);
    setAddingUnitTo(c.proveedor);
  };

  const deleteUnit = async (id) => {
    if (!confirm("Eliminar este tipo de unidad?")) return;
    await supabase.from("carriers").delete().eq("id", id);
    loadCarriers();
  };

  const deleteCarrier = async (proveedor) => {
    if (!confirm("Eliminar " + proveedor + " y todos sus tipos de unidad?")) return;
    await supabase.from("carriers").delete().eq("proveedor", proveedor);
    loadCarriers();
  };

  const grouped = {};
  carriers.forEach(c => {
    if (!grouped[c.proveedor]) grouped[c.proveedor] = [];
    grouped[c.proveedor].push(c);
  });
  const proveedores = Object.keys(grouped);

  const realUnits = carriers.filter(c => c.tipo_unidad !== "---");
  const filteredUnits = realUnits.filter(c => {
    if (filterOp !== "Todas" && c.operacion !== filterOp) return false;
    if (filterProv !== "Todos" && c.proveedor !== filterProv) return false;
    return true;
  });
  const filteredProvs = [...new Set(filteredUnits.map(c => c.proveedor))];
  const totalProveedores = filteredProvs.length;
  const totalUnidades = filteredUnits.length;
  const avgCosto = filteredUnits.length > 0 ? (filteredUnits.reduce((s, c) => s + parseFloat(c.costo_unidad), 0) / filteredUnits.length).toFixed(0) : 0;
  const costoTotalDia = filteredUnits.reduce((s, c) => s + parseFloat(c.costo_unidad), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Carriers / Proveedores</h1>
          <p style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>Catalogo de proveedores, tipos de unidad y costos asociados</p>
        </div>
        <button onClick={() => setShowNewCarrier(!showNewCarrier)} style={{ padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: showNewCarrier ? C.textMuted : C.accent, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          {showNewCarrier ? <><IC.X /> Cancelar</> : <><IC.Plus /> Nuevo carrier</>}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted }}>Filtrar:</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["Todas", "Última milla", "Half mile"].map(op => (
            <button key={op} onClick={() => setFilterOp(op)} style={{
              padding: "6px 14px", borderRadius: 6, border: "1px solid " + (filterOp === op ? C.accent : C.border),
              backgroundColor: filterOp === op ? C.accentLight : C.white, color: filterOp === op ? C.accent : C.textMuted,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>{op}</button>
          ))}
        </div>
        <div style={{ width: 1, height: 20, backgroundColor: C.border }} />
        <select value={filterProv} onChange={e => setFilterProv(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer" }}>
          <option value="Todos">Todos los proveedores</option>
          {proveedores.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(filterOp !== "Todas" || filterProv !== "Todos") && (
          <button onClick={() => { setFilterOp("Todas"); setFilterProv("Todos"); }} style={{ padding: "6px 10px", borderRadius: 6, border: "none", backgroundColor: C.redBg, color: C.red, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Limpiar filtros</button>
        )}
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <StatCard label="Proveedores" value={totalProveedores.toString()} icon={<IC.Users />} color={C.blue} />
        <StatCard label="Tipos de unidad" value={totalUnidades.toString()} icon={<IC.Truck />} color={C.green} />
        <StatCard label="Costo promedio" value={"$" + avgCosto} subvalue="por unidad/dia" icon={<IC.Dollar />} color={C.accent} />
        <StatCard label="Costo total/dia" value={"$" + costoTotalDia.toLocaleString()} subvalue={totalUnidades + " unidades"} icon={<IC.Dollar />} color={C.purple} />
      </div>

      {showNewCarrier && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 20, border: "2px solid " + C.accent, marginBottom: 20, display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Nombre del proveedor / carrier</label>
            <input value={newCarrierName} onChange={e => setNewCarrierName(e.target.value)} onKeyDown={e => e.key === "Enter" && createCarrier()} placeholder="Ej: CARDO, KEKO, FAST INTEGRAL" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid " + C.border, fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <button onClick={createCarrier} style={{ padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: C.green, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Crear carrier</button>
        </div>
      )}

      {proveedores.filter(prov => filterProv === "Todos" || prov === filterProv).map((prov, pi) => {
        const units = grouped[prov].filter(c => c.tipo_unidad !== "---" && (filterOp === "Todas" || c.operacion === filterOp));
        const totalCosto = units.reduce((s, c) => s + parseFloat(c.costo_unidad), 0);
        const isAdding = addingUnitTo === prov;
        return (
          <div key={pi} style={{ backgroundColor: C.white, borderRadius: 12, border: "1px solid " + C.border, marginBottom: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAFBFF" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: C.accent + "18", display: "flex", alignItems: "center", justifyContent: "center", color: C.accent }}><IC.Truck /></div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{prov}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{units.length} tipo{units.length !== 1 ? "s" : ""} de unidad{units.length > 0 ? " - Costo total: $" + totalCosto.toLocaleString() + "/dia" : ""}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setAddingUnitTo(isAdding ? null : prov); setEditId(null); setUnitForm({ tipo_unidad: "Sedan", operacion: "Última milla", costo_unidad: "" }); }} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid " + (isAdding ? C.textMuted : C.accent), backgroundColor: isAdding ? C.bg : C.accentLight, color: isAdding ? C.textMuted : C.accent, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  {isAdding ? <><IC.X /> Cancelar</> : <><IC.Plus /> Agregar unidad</>}
                </button>
                <button onClick={() => deleteCarrier(prov)} style={{ padding: "6px 10px", borderRadius: 6, border: "none", backgroundColor: C.redBg, color: C.red, fontSize: 11, fontWeight: 600, cursor: "pointer" }}><IC.Trash /></button>
              </div>
            </div>
            {isAdding && (
              <div style={{ padding: "14px 20px", borderBottom: "1px solid " + C.border, backgroundColor: "#FFFBFA", display: "flex", alignItems: "flex-end", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.text, marginBottom: 3 }}>Tipo de unidad</label>
                  <select value={unitForm.tipo_unidad} onChange={e => setUnitForm({...unitForm, tipo_unidad: e.target.value})} style={{ width: "100%", padding: "7px 8px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, boxSizing: "border-box" }}>
                    {TIPOS_UNIDAD.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.text, marginBottom: 3 }}>Operacion</label>
                  <select value={unitForm.operacion} onChange={e => setUnitForm({...unitForm, operacion: e.target.value})} style={{ width: "100%", padding: "7px 8px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, boxSizing: "border-box" }}>
                    <option value="Última milla">Ultima milla</option>
                    <option value="Half mile">Half mile</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.text, marginBottom: 3 }}>Costo / Unidad / Dia ($)</label>
                  <input type="number" value={unitForm.costo_unidad} onChange={e => setUnitForm({...unitForm, costo_unidad: e.target.value})} placeholder="995" style={{ width: "100%", padding: "7px 8px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, boxSizing: "border-box" }} />
                </div>
                <button onClick={() => addUnit(prov)} style={{ padding: "7px 18px", borderRadius: 6, border: "none", backgroundColor: C.green, color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{editId ? "Guardar" : "Agregar"}</button>
              </div>
            )}
            {units.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid " + C.border }}>
                    {["Tipo unidad", "Operacion", "Costo/Unidad/Dia", "Acciones"].map(h => (
                      <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {units.map((c, ci) => {
                    const tipoColors = { Moto: { bg: "#FEF3C7", c: "#D97706" }, Sedan: { bg: C.blueBg, c: C.blue }, SmallVan: { bg: C.purpleBg, c: C.purple }, Van: { bg: C.purpleBg, c: C.purple }, LargeVan: { bg: "#EDE9FE", c: "#6D28D9" }, "5 Ton": { bg: C.yellowBg, c: C.yellow }, Rabon: { bg: "#FFEDD5", c: "#EA580C" }, Torton: { bg: C.redBg, c: C.red }, Tracto: { bg: "#F1F5F9", c: "#475569" } };
                    const tc = tipoColors[c.tipo_unidad] || { bg: "#F3F4F6", c: C.textMuted };
                    return (
                      <tr key={ci} style={{ borderBottom: "1px solid " + C.border }}>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 4, backgroundColor: tc.bg, color: tc.c }}>{c.tipo_unidad}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 4, backgroundColor: c.operacion === "Última milla" ? C.greenBg : C.accentLight, color: c.operacion === "Última milla" ? C.green : C.accent }}>{c.operacion || "Última milla"}</span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: C.text }}>${parseFloat(c.costo_unidad).toLocaleString()}</td>
                        <td style={{ padding: "12px 16px", display: "flex", gap: 6 }}>
                          <button onClick={() => editUnit(c)} style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid " + C.border, backgroundColor: C.white, cursor: "pointer", fontSize: 11, fontWeight: 600, color: C.text, display: "flex", alignItems: "center", gap: 4 }}><IC.Edit /> Editar</button>
                          <button onClick={() => deleteUnit(c.id)} style={{ padding: "4px 10px", borderRadius: 4, border: "none", backgroundColor: C.redBg, cursor: "pointer", fontSize: 11, fontWeight: 600, color: C.red, display: "flex", alignItems: "center", gap: 4 }}><IC.Trash /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "20px 20px", textAlign: "center", color: C.textMuted, fontSize: 12 }}>
                Sin tipos de unidad — usa "Agregar unidad" para registrar
              </div>
            )}
          </div>
        );
      })}

      {carriers.length === 0 && !loading && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 48, border: "1px solid " + C.border, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚛</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>No hay carriers registrados</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8 }}>Usa "Nuevo carrier" para crear un proveedor y luego agregar tipos de unidad</div>
        </div>
      )}
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
      case "carriers": return <ModuleCarriers />;
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