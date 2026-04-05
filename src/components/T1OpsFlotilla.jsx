"use client";
import { useState, useEffect, useRef } from "react";
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
  MapPin: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  ClipboardCheck: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><polyline points="9,12 11,14 15,10"/></svg>,
  ExternalLink: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
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
  { label: "HERRAMIENTAS", items: [
    { id: "ruteo", label: "Ruteo / Clusters", icon: IC.Map, badge: "Nuevo" },
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
  const [operadores, setOperadores] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [form, setForm] = useState({ nombre: "", proveedor: "", tipo_licencia: "A" });
  const [saveMsg, setSaveMsg] = useState("");
  const [bulkProveedor, setBulkProveedor] = useState("");
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkMsg, setBulkMsg] = useState("");
  const [importing, setImporting] = useState(false);

  const LICENCIAS = ["A", "B", "C", "D", "E"];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: ops }, { data: cars }] = await Promise.all([
      supabase.from("operadores").select("*").order("nombre"),
      supabase.from("carriers").select("proveedor").order("proveedor"),
    ]);
    setOperadores(ops || []);
    setProveedores([...new Set((cars || []).map(c => c.proveedor))].sort());
    setLoading(false);
  };

  const saveOperador = async () => {
    if (!form.nombre.trim() || !form.proveedor) return;
    setSaveMsg("");
    const { error } = await supabase.from("operadores").insert({
      nombre: form.nombre.trim(),
      proveedor: form.proveedor,
      tipo_licencia: form.tipo_licencia,
      activo: true,
    });
    if (error) { setSaveMsg("Error: " + error.message); return; }
    setForm({ nombre: "", proveedor: "", tipo_licencia: "A" });
    setShowForm(false);
    loadData();
  };

  const deleteOperador = async (id) => {
    if (!confirm("¿Eliminar este operador?")) return;
    await supabase.from("operadores").delete().eq("id", id);
    loadData();
  };

  const toggleActivo = async (id, activo) => {
    await supabase.from("operadores").update({ activo: !activo }).eq("id", id);
    loadData();
  };

  const parseBulkFile = async (file) => {
    setBulkPreview([]);
    setBulkMsg("");
    try {
      const xlsxMod = await import("xlsx");
      const XLSX = xlsxMod.default || xlsxMod;
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      // Each operator = 5 rows: 1=Nombre, 2=Correo, 3=Tipo, 4=Ignorar, 5=Estatus
      const ops = [];
      for (let i = 0; i < rows.length; i += 5) {
        const nombre = String(rows[i]?.[0] || "").trim();
        const correo = String(rows[i+1]?.[0] || "").trim();
        const tipo = String(rows[i+2]?.[0] || "").trim();
        const estatus = String(rows[i+4]?.[0] || "").trim();
        if (nombre) ops.push({ nombre, correo, tipo, estatus });
      }
      if (ops.length === 0) { setBulkMsg("No se encontraron operadores en el archivo."); return; }
      setBulkPreview(ops);
    } catch (e) {
      setBulkMsg("Error al leer el archivo: " + e.message);
    }
  };

  const parseBulkCSV = async (file) => {
    setBulkPreview([]);
    setBulkMsg("");
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(l => l.trim());
      const ops = [];
      for (let i = 0; i < lines.length; i += 5) {
        const nombre = (lines[i]?.split(",")[0] || "").trim().replace(/^"|"$/g, "");
        const correo = (lines[i+1]?.split(",")[0] || "").trim().replace(/^"|"$/g, "");
        const tipo = (lines[i+2]?.split(",")[0] || "").trim().replace(/^"|"$/g, "");
        const estatus = (lines[i+4]?.split(",")[0] || "").trim().replace(/^"|"$/g, "");
        if (nombre) ops.push({ nombre, correo, tipo, estatus });
      }
      if (ops.length === 0) { setBulkMsg("No se encontraron operadores en el archivo."); return; }
      setBulkPreview(ops);
    } catch (e) {
      setBulkMsg("Error al leer el archivo: " + e.message);
    }
  };

  const handleBulkFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith(".csv")) {
      await parseBulkCSV(file);
    } else {
      await parseBulkFile(file);
    }
  };

  const importarOperadores = async () => {
    if (!bulkProveedor || bulkPreview.length === 0) return;
    setImporting(true);
    setBulkMsg("");
    const rows = bulkPreview.map(op => ({
      nombre: op.nombre,
      proveedor: bulkProveedor,
      correo: op.correo || null,
      tipo: op.tipo || "Operador",
      tipo_licencia: "A",
      estatus: op.estatus || "ACTIVE",
      activo: op.estatus !== "INACTIVE",
    }));
    const { error } = await supabase.from("operadores").insert(rows);
    setImporting(false);
    if (error) { setBulkMsg("Error: " + error.message); return; }
    setBulkMsg("✓ " + rows.length + " operadores importados correctamente.");
    setBulkPreview([]);
    setBulkProveedor("");
    loadData();
  };

  const activos = operadores.filter(o => o.activo).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Operadores</h1>
          <p style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>Base de datos de operadores por proveedor — usada en el check-in</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setShowBulk(!showBulk); setShowForm(false); setBulkPreview([]); setBulkMsg(""); }}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: showBulk ? C.textMuted : C.purple, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {showBulk ? <><IC.X /> Cancelar</> : <><IC.Plus /> Carga masiva</>}
          </button>
          <button onClick={() => { setShowForm(!showForm); setShowBulk(false); }}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: showForm ? C.textMuted : C.accent, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {showForm ? <><IC.X /> Cancelar</> : <><IC.Plus /> Nuevo operador</>}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total operadores" value={operadores.length.toString()} icon={<IC.Users />} color={C.blue} />
        <StatCard label="Activos" value={activos.toString()} icon={<IC.Check />} color={C.green} />
        <StatCard label="Inactivos" value={(operadores.length - activos).toString()} icon={<IC.X />} color={C.red} />
        <StatCard label="Proveedores" value={[...new Set(operadores.map(o => o.proveedor).filter(Boolean))].length.toString()} icon={<IC.Truck />} color={C.purple} />
      </div>

      {showBulk && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 24, border: "2px solid " + C.purple, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: C.purple }}>Carga masiva de operadores</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 18 }}>Sube un archivo Excel o CSV. Formato: 5 filas por operador en columna A (Nombre, Correo, Tipo, Ubicación, Estatus), comenzando en fila 1.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Etiqueta / Proveedor</label>
              <select value={bulkProveedor} onChange={e => setBulkProveedor(e.target.value)}
                style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 13, boxSizing: "border-box" }}>
                <option value="">Seleccionar proveedor...</option>
                {proveedores.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Todos los operadores del archivo se asignarán a este proveedor.</div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Archivo (.xlsx, .xls, .csv)</label>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkFile}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 13, boxSizing: "border-box", backgroundColor: "#FAFBFF" }} />
            </div>
          </div>

          {bulkPreview.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Vista previa — {bulkPreview.length} operadores detectados:</div>
              <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid " + C.border, borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid " + C.border, backgroundColor: "#FAFBFF" }}>
                      <th style={{ padding: "6px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>#</th>
                      <th style={{ padding: "6px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Nombre</th>
                      <th style={{ padding: "6px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Correo</th>
                      <th style={{ padding: "6px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Tipo</th>
                      <th style={{ padding: "6px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Estatus</th>
                      <th style={{ padding: "6px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Proveedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkPreview.map((op, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid " + C.border }}>
                        <td style={{ padding: "6px 12px", fontSize: 12, color: C.textMuted }}>{i + 1}</td>
                        <td style={{ padding: "6px 12px", fontSize: 13, fontWeight: 600, color: C.text }}>{op.nombre}</td>
                        <td style={{ padding: "6px 12px", fontSize: 12, color: C.textMuted }}>{op.correo}</td>
                        <td style={{ padding: "6px 12px", fontSize: 12, color: C.textMuted }}>{op.tipo}</td>
                        <td style={{ padding: "6px 12px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, backgroundColor: op.estatus === "ACTIVE" ? C.greenBg : C.redBg, color: op.estatus === "ACTIVE" ? C.green : C.red }}>{op.estatus}</span>
                        </td>
                        <td style={{ padding: "6px 12px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, backgroundColor: "#F3EEFF", color: C.purple }}>{bulkProveedor || "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {bulkMsg && (
            <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: bulkMsg.startsWith("✓") ? C.green : C.red, padding: "10px 14px", borderRadius: 8, backgroundColor: bulkMsg.startsWith("✓") ? C.greenBg : C.redBg }}>
              {bulkMsg}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={() => { setShowBulk(false); setBulkPreview([]); setBulkMsg(""); setBulkProveedor(""); }}
              style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid " + C.border, backgroundColor: C.white, fontSize: 13, cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={importarOperadores} disabled={!bulkProveedor || bulkPreview.length === 0 || importing}
              style={{ padding: "8px 24px", borderRadius: 8, border: "none", backgroundColor: bulkProveedor && bulkPreview.length > 0 && !importing ? C.purple : C.border, color: "white", fontSize: 13, fontWeight: 700, cursor: bulkProveedor && bulkPreview.length > 0 && !importing ? "pointer" : "default" }}>
              {importing ? "Importando..." : `Importar ${bulkPreview.length} operadores`}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 24, border: "2px solid " + C.accent, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: C.accent }}>Nuevo operador</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Nombre completo</label>
              <input type="text" placeholder="Nombre del operador" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Proveedor</label>
              <select value={form.proveedor} onChange={e => setForm({ ...form, proveedor: e.target.value })}
                style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 13, boxSizing: "border-box" }}>
                <option value="">Seleccionar proveedor...</option>
                {proveedores.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Tipo licencia</label>
              <select value={form.tipo_licencia} onChange={e => setForm({ ...form, tipo_licencia: e.target.value })}
                style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 13, boxSizing: "border-box" }}>
                {LICENCIAS.map(l => <option key={l} value={l}>Tipo {l}</option>)}
              </select>
            </div>
          </div>
          {saveMsg && <div style={{ marginBottom: 10, fontSize: 13, color: C.red }}>{saveMsg}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid " + C.border, backgroundColor: C.white, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
            <button onClick={saveOperador} disabled={!form.nombre.trim() || !form.proveedor}
              style={{ padding: "8px 24px", borderRadius: 8, border: "none", backgroundColor: form.nombre.trim() && form.proveedor ? C.accent : C.border, color: "white", fontSize: 13, fontWeight: 700, cursor: form.nombre.trim() && form.proveedor ? "pointer" : "default" }}>
              Guardar operador
            </button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: C.white, borderRadius: 12, border: "1px solid " + C.border, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Cargando...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid " + C.border }}>
                {["Nombre", "Proveedor", "Licencia", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {operadores.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", color: C.textMuted }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>👤</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Sin operadores registrados</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Agrega operadores para usarlos en el check-in</div>
                </td></tr>
              ) : operadores.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid " + C.border }}
                  onMouseEnter={ev => ev.currentTarget.style.backgroundColor = "#FAFBFF"}
                  onMouseLeave={ev => ev.currentTarget.style.backgroundColor = "transparent"}>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: C.text }}>{o.nombre}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: C.textMuted }}>{o.proveedor}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, backgroundColor: C.blueBg, color: C.blue }}>Tipo {o.tipo_licencia}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => toggleActivo(o.id, o.activo)} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "none", cursor: "pointer", backgroundColor: o.activo ? C.greenBg : C.redBg, color: o.activo ? C.green : C.red }}>
                      {o.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => deleteOperador(o.id)} style={{ padding: "4px 8px", borderRadius: 4, border: "none", backgroundColor: C.redBg, cursor: "pointer", color: C.red }}><IC.Trash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


// --- REGISTRO DIARIO (unificado con Asistencia) ---
function ModuleCostos() {
  const [asistencia, setAsistencia] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fecha: new Date().toISOString().split("T")[0], proveedor: "" });
  const [lineas, setLineas] = useState([{ tipo_unidad: "", operacion: "Última Milla", cantidad: "1" }]);
  const [filtroDesde, setFiltroDesde] = useState(new Date().toISOString().split("T")[0]);
  const [filtroHasta, setFiltroHasta] = useState(new Date().toISOString().split("T")[0]);
  const [filtroProv, setFiltroProv] = useState("Todos");
  const [saveMsg, setSaveMsg] = useState("");
  const checkinUrl = typeof window !== "undefined" ? window.location.origin + "/checkin" : "/checkin";

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: asiData }, { data: carsData }] = await Promise.all([
      supabase.from("asistencia").select("*").order("timestamp", { ascending: false }),
      supabase.from("carriers").select("*").order("proveedor"),
    ]);
    setAsistencia(asiData || []);
    setCarriers((carsData || []).filter(c => c.tipo_unidad && c.tipo_unidad !== "—"));
    setLoading(false);
  };

  const getCosto = r => parseFloat(carriers.find(c => c.proveedor === r.proveedor && c.tipo_unidad === r.tipo_unidad)?.costo_unidad) || 0;
  const proveedores = [...new Set(carriers.map(c => c.proveedor))];
  const tiposDisponibles = carriers.filter(c => c.proveedor === form.proveedor);
  const getCarrierForLine = l => carriers.find(c => c.proveedor === form.proveedor && c.tipo_unidad === l.tipo_unidad);
  const getCostoLine = l => (parseFloat(getCarrierForLine(l)?.costo_unidad) || 0) * (parseInt(l.cantidad) || 0);
  const costoTotalForm = lineas.reduce((s, l) => s + getCostoLine(l), 0);
  const allLinesValid = form.proveedor && lineas.every(l => l.tipo_unidad && l.cantidad);
  const proveedoresRegistro = [...new Set(asistencia.map(r => r.proveedor).filter(Boolean))].sort();

  const filtrados = asistencia.filter(r => {
    const f = (r.fecha || "").substring(0, 10);
    if (f < filtroDesde || f > filtroHasta) return false;
    if (filtroProv !== "Todos" && r.proveedor !== filtroProv) return false;
    return true;
  });

  const totalCosto = filtrados.reduce((s, r) => s + getCosto(r), 0);
  const totalUM = filtrados.filter(r => r.tipo_operacion === "Última Milla").reduce((s, r) => s + getCosto(r), 0);
  const totalCD = filtrados.filter(r => r.tipo_operacion === "CrossDock").reduce((s, r) => s + getCosto(r), 0);
  const totalLI = filtrados.filter(r => r.tipo_operacion === "Logística Inversa").reduce((s, r) => s + getCosto(r), 0);

  const resumen = {};
  filtrados.forEach(r => {
    const key = r.fecha + "|" + r.proveedor;
    if (!resumen[key]) resumen[key] = { fecha: r.fecha, proveedor: r.proveedor, ops: 0, costo: 0, tipos: {} };
    resumen[key].ops += 1;
    resumen[key].costo += getCosto(r);
    resumen[key].tipos[r.tipo_unidad] = (resumen[key].tipos[r.tipo_unidad] || 0) + 1;
  });
  const resumenList = Object.values(resumen).sort((a, b) => b.fecha.localeCompare(a.fecha) || a.proveedor.localeCompare(b.proveedor));

  const opColors = { "Última Milla": C.accent, CrossDock: C.blue, "Logística Inversa": C.purple };
  const opBgs   = { "Última Milla": C.accentLight, CrossDock: C.blueBg, "Logística Inversa": C.purpleBg };
  const tipoColors = { Moto:{bg:"#FEF3C7",c:"#D97706"}, Sedan:{bg:"#DBEAFE",c:"#2563EB"}, SmallVan:{bg:"#EDE9FE",c:"#7C3AED"}, Van:{bg:"#EDE9FE",c:"#7C3AED"}, "1.5":{bg:"#FEF9C3",c:"#CA8A04"}, "3.5":{bg:"#FFEDD5",c:"#C2410C"}, Rabon:{bg:"#FFEDD5",c:"#EA580C"}, Torton:{bg:"#FEE2E2",c:"#DC2626"}, Tracto:{bg:"#F1F5F9",c:"#475569"} };
  const fmt = ts => { if (!ts) return "—"; const d = new Date(ts); return d.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"}); };

  const saveRegistroManual = async () => {
    if (!allLinesValid) return;
    setSaveMsg("");
    const rows = lineas.map(l => ({
      fecha: form.fecha, proveedor: form.proveedor, nombre_operador: "Registro manual",
      tipo_unidad: l.tipo_unidad, tipo_operacion: l.operacion,
      latitud: null, longitud: null, timestamp: new Date().toISOString(),
    }));
    const { error } = await supabase.from("asistencia").insert(rows);
    if (error) { setSaveMsg("Error: " + error.message); return; }
    setSaveMsg("✓ Registrado");
    setForm({ fecha: form.fecha, proveedor: "" });
    setLineas([{ tipo_unidad: "", operacion: "Última Milla", cantidad: "1" }]);
    setShowForm(false);
    loadData();
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const deleteRegistro = async id => {
    if (!confirm("¿Eliminar este registro?")) return;
    await supabase.from("asistencia").delete().eq("id", id);
    loadData();
  };

  const fmtMoney = n => "$" + (n >= 1000000 ? (n/1000000).toFixed(1)+"M" : n >= 1000 ? (n/1000).toFixed(0)+"K" : n.toLocaleString());

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, margin:0 }}>Registro Diario</h1>
          <p style={{ color:C.textMuted, fontSize:13, marginTop:2 }}>Asistencia de operadores · Costos por operación</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setShowForm(!showForm)} style={{ padding:"9px 16px", borderRadius:8, border:"1px solid "+C.border, backgroundColor:showForm?C.textMuted:C.white, color:showForm?"white":C.text, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            {showForm ? <><IC.X /> Cancelar</> : <><IC.Plus /> Registro manual</>}
          </button>
          <a href="/checkin" target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:8, border:"none", backgroundColor:C.accent, color:"white", fontSize:13, fontWeight:600, cursor:"pointer", textDecoration:"none" }}>
            <IC.MapPin /> Check-in <IC.ExternalLink />
          </a>
        </div>
      </div>

      {/* Link bar */}
      <div style={{ backgroundColor:C.blueBg, border:"1px solid "+C.blue+"33", borderRadius:10, padding:"10px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <span style={{ fontSize:12, color:C.textMuted, fontWeight:600 }}>Enlace check-in para operadores:</span>
        <code style={{ fontSize:12, backgroundColor:C.white, padding:"3px 10px", borderRadius:6, border:"1px solid "+C.border, color:C.blue, userSelect:"all", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{checkinUrl}</code>
        <button onClick={() => navigator.clipboard?.writeText(checkinUrl)} style={{ padding:"4px 12px", borderRadius:6, border:"1px solid "+C.blue, backgroundColor:"transparent", color:C.blue, fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0 }}>Copiar</button>
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        <span style={{ fontSize:12, fontWeight:700, color:C.textMuted }}>Periodo:</span>
        <input type="date" value={filtroDesde} onChange={e => { setFiltroDesde(e.target.value); if (e.target.value>filtroHasta) setFiltroHasta(e.target.value); }} style={{ padding:"7px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, fontWeight:600 }} />
        <span style={{ fontSize:12, color:C.textMuted }}>al</span>
        <input type="date" value={filtroHasta} onChange={e => { if (e.target.value>=filtroDesde) setFiltroHasta(e.target.value); }} style={{ padding:"7px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, fontWeight:600 }} />
        <div style={{ width:1, height:20, backgroundColor:C.border }} />
        <select value={filtroProv} onChange={e => setFiltroProv(e.target.value)} style={{ padding:"6px 12px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, fontWeight:600, color:C.text, cursor:"pointer" }}>
          <option value="Todos">Todos los proveedores</option>
          {proveedoresRegistro.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {filtroProv !== "Todos" && <button onClick={() => setFiltroProv("Todos")} style={{ padding:"5px 10px", borderRadius:6, border:"none", backgroundColor:C.redBg, color:C.red, fontSize:11, fontWeight:600, cursor:"pointer" }}>Limpiar</button>}
        <button onClick={loadData} style={{ marginLeft:"auto", padding:"6px 12px", borderRadius:6, border:"1px solid "+C.border, backgroundColor:C.white, color:C.textMuted, fontSize:12, cursor:"pointer" }}>↻</button>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(145px,1fr))", gap:14, marginBottom:20 }}>
        {[
          { label:"Operadores registrados", value:filtrados.length, color:C.blue },
          { label:"Costo total", value:fmtMoney(totalCosto), color:C.purple },
          { label:"Última Milla", value:fmtMoney(totalUM), color:C.accent },
          { label:"CrossDock", value:fmtMoney(totalCD), color:C.blue },
          { label:"Logística Inversa", value:fmtMoney(totalLI), color:C.purple },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor:C.white, borderRadius:10, padding:"14px 16px", border:"1px solid "+C.border }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Formulario registro manual */}
      {showForm && (
        <div style={{ backgroundColor:C.white, borderRadius:12, padding:24, border:"2px solid "+C.border, marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16, color:C.text }}>Registro manual de unidad</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:14, marginBottom:14 }}>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.text, marginBottom:4 }}>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm({...form,fecha:e.target.value})} style={{ width:"100%", padding:"9px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:13, boxSizing:"border-box" }} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.text, marginBottom:4 }}>Proveedor</label>
              <select value={form.proveedor} onChange={e => { setForm({...form,proveedor:e.target.value}); setLineas([{tipo_unidad:"",operacion:"Última Milla",cantidad:"1"}]); }} style={{ width:"100%", padding:"9px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:13, boxSizing:"border-box" }}>
                <option value="">Seleccionar proveedor...</option>
                {proveedores.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          {form.proveedor && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr 0.7fr 36px", gap:10, marginBottom:6 }}>
                {["TIPO DE UNIDAD","OPERACIÓN","CANT.",""].map(h => <span key={h} style={{ fontSize:10, fontWeight:700, color:C.textMuted }}>{h}</span>)}
              </div>
              {lineas.map((l, idx) => (
                <div key={idx} style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr 0.7fr 36px", gap:10, marginBottom:8, alignItems:"center" }}>
                  <select value={l.tipo_unidad} onChange={e => { const u=[...lineas]; u[idx]={...u[idx],tipo_unidad:e.target.value}; setLineas(u); }} style={{ padding:"8px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, boxSizing:"border-box" }}>
                    <option value="">Tipo...</option>
                    {tiposDisponibles.map(c => <option key={c.id} value={c.tipo_unidad}>{c.tipo_unidad} — ${parseFloat(c.costo_unidad).toLocaleString()}/día</option>)}
                  </select>
                  <select value={l.operacion} onChange={e => { const u=[...lineas]; u[idx]={...u[idx],operacion:e.target.value}; setLineas(u); }} style={{ padding:"8px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, boxSizing:"border-box" }}>
                    <option value="Última Milla">Última Milla</option>
                    <option value="CrossDock">CrossDock</option>
                    <option value="Logística Inversa">Logística Inversa</option>
                  </select>
                  <input type="number" min="1" value={l.cantidad} onChange={e => { const u=[...lineas]; u[idx]={...u[idx],cantidad:e.target.value}; setLineas(u); }} style={{ padding:"8px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, boxSizing:"border-box" }} />
                  {lineas.length > 1 ? <button onClick={() => setLineas(lineas.filter((_,i)=>i!==idx))} style={{ padding:4, border:"none", backgroundColor:C.redBg, borderRadius:4, cursor:"pointer", color:C.red, display:"flex", alignItems:"center", justifyContent:"center" }}><IC.X /></button> : <div />}
                </div>
              ))}
              <button onClick={() => setLineas([...lineas,{tipo_unidad:"",operacion:"Última Milla",cantidad:"1"}])} style={{ padding:"5px 12px", borderRadius:6, border:"1px dashed "+C.accent, backgroundColor:"transparent", color:C.accent, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:4, marginTop:4 }}><IC.Plus /> Agregar tipo</button>
            </div>
          )}
          {costoTotalForm > 0 && (
            <div style={{ marginTop:14, padding:"12px 16px", borderRadius:8, backgroundColor:"#F0FDF4", border:"1px solid "+C.green+"40" }}>
              {lineas.filter(l=>l.tipo_unidad).map((l,i)=>{
                const cu=parseFloat(getCarrierForLine(l)?.costo_unidad)||0, cant=parseInt(l.cantidad)||0;
                return <div key={i} style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3 }}><span>{l.tipo_unidad} ({l.operacion}) × {cant}</span><span style={{fontWeight:700}}>${(cu*cant).toLocaleString()}</span></div>;
              })}
              <div style={{ borderTop:"1px solid "+C.green+"30",marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between" }}>
                <span style={{fontSize:12,color:C.textMuted}}>Total</span>
                <span style={{fontSize:20,fontWeight:800,color:C.green}}>${costoTotalForm.toLocaleString()}</span>
              </div>
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:14 }}>
            <button onClick={() => setShowForm(false)} style={{ padding:"8px 20px", borderRadius:8, border:"1px solid "+C.border, backgroundColor:C.white, fontSize:13, cursor:"pointer", fontWeight:600 }}>Cancelar</button>
            <button onClick={saveRegistroManual} disabled={!allLinesValid} style={{ padding:"8px 24px", borderRadius:8, border:"none", backgroundColor:allLinesValid?C.green:C.border, color:"white", fontSize:13, fontWeight:700, cursor:allLinesValid?"pointer":"default" }}>✓ Guardar</button>
          </div>
          {saveMsg && <div style={{ marginTop:8, fontSize:13, fontWeight:600, color:saveMsg.startsWith("✓")?C.green:C.red }}>{saveMsg}</div>}
        </div>
      )}

      {/* Resumen por día × proveedor */}
      {resumenList.length > 0 && (
        <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, overflow:"hidden", marginBottom:16 }}>
          <div style={{ padding:"13px 18px", borderBottom:"1px solid "+C.border, fontSize:13, fontWeight:700, color:C.text }}>Resumen por día y proveedor</div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ backgroundColor:C.bg }}>
                {["Fecha","Proveedor","Tipos de unidad","Operadores","Costo"].map(h => (
                  <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resumenList.map((r, i) => (
                <tr key={i} style={{ borderTop:"1px solid "+C.border }}
                  onMouseEnter={ev=>ev.currentTarget.style.backgroundColor="#FAFBFF"}
                  onMouseLeave={ev=>ev.currentTarget.style.backgroundColor="transparent"}>
                  <td style={{ padding:"10px 14px", fontSize:12, color:C.textMuted, whiteSpace:"nowrap" }}>{r.fecha}</td>
                  <td style={{ padding:"10px 14px", fontSize:13, fontWeight:600 }}>{r.proveedor}</td>
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {Object.entries(r.tipos).map(([tipo, cnt]) => {
                        const tc = tipoColors[tipo] || {bg:"#F3F4F6",c:"#7C8495"};
                        return <span key={tipo} style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:4, backgroundColor:tc.bg, color:tc.c, whiteSpace:"nowrap" }}>{tipo} ×{cnt}</span>;
                      })}
                    </div>
                  </td>
                  <td style={{ padding:"10px 14px", fontSize:13, fontWeight:700 }}>{r.ops}</td>
                  <td style={{ padding:"10px 14px", fontSize:14, fontWeight:700, color:C.green }}>${r.costo.toLocaleString()}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor:"#FAFBFF", borderTop:"2px solid "+C.border }}>
                <td colSpan={2} style={{ padding:"10px 14px", fontSize:13, fontWeight:800 }}>TOTAL</td>
                <td style={{ padding:"10px 14px" }} />
                <td style={{ padding:"10px 14px", fontSize:13, fontWeight:800 }}>{resumenList.reduce((s,r)=>s+r.ops,0)}</td>
                <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800, color:C.green }}>${resumenList.reduce((s,r)=>s+r.costo,0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tabla principal */}
      <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, overflow:"hidden" }}>
        <div style={{ padding:"13px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Operadores del periodo</div>
          <div style={{ fontSize:12, color:C.textMuted }}>{filtrados.length} registros</div>
        </div>
        {loading ? (
          <div style={{ padding:40, textAlign:"center", color:C.textMuted }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding:48, textAlign:"center", color:C.textMuted }}>
            <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>Sin registros en este periodo</div>
            <div style={{ fontSize:13 }}>Los operadores se registran usando el enlace de check-in</div>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ backgroundColor:C.bg }}>
                  {["Fecha","Hora","Operador","Proveedor","Unidad","Operación","Costo",""].map(h => (
                    <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((r, i) => {
                  const costo = getCosto(r);
                  const tc = tipoColors[r.tipo_unidad] || {bg:"#F3F4F6",c:"#7C8495"};
                  return (
                    <tr key={r.id} style={{ borderTop:"1px solid "+C.border }}
                      onMouseEnter={ev=>ev.currentTarget.style.backgroundColor="#FAFBFF"}
                      onMouseLeave={ev=>ev.currentTarget.style.backgroundColor="transparent"}>
                      <td style={{ padding:"10px 14px", color:C.textMuted, whiteSpace:"nowrap" }}>{r.fecha}</td>
                      <td style={{ padding:"10px 14px", color:C.textMuted, whiteSpace:"nowrap" }}>{fmt(r.timestamp)}</td>
                      <td style={{ padding:"10px 14px", fontWeight:600, color:C.text }}>
                        {r.nombre_operador === "Registro manual"
                          ? <span style={{color:C.textMuted,fontStyle:"italic"}}>Manual</span>
                          : r.nombre_operador}
                      </td>
                      <td style={{ padding:"10px 14px", color:C.text }}>{r.proveedor}</td>
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4, backgroundColor:tc.bg, color:tc.c }}>{r.tipo_unidad}</span>
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, backgroundColor:opBgs[r.tipo_operacion]||C.bg, color:opColors[r.tipo_operacion]||C.textMuted }}>{r.tipo_operacion}</span>
                      </td>
                      <td style={{ padding:"10px 14px", fontWeight:700, color:costo>0?C.green:C.textMuted }}>
                        {costo > 0 ? "$"+costo.toLocaleString() : "—"}
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        <button onClick={() => deleteRegistro(r.id)} style={{ padding:"3px 7px", borderRadius:4, border:"none", backgroundColor:C.redBg, cursor:"pointer", color:C.red }}><IC.Trash /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

  const TIPOS_UNIDAD = ["Moto", "Sedan", "SmallVan", "Van", "1.5", "3.5", "Rabon", "Torton", "Tracto"];

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

// --- RUTEO Y CLUSTERIZACIÓN ---
function ModuleRuteo() {
  const [puntos, setPuntos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [numClusters, setNumClusters] = useState(5);
  const [sesionId, setSesionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapDivRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const sesionIdRef = useRef("");

  const DEPOSITO_LAT = 19.398892731487283;
  const DEPOSITO_LNG = -99.11677448852873;
  const RCOLORS = ['#E63B2E','#2563EB','#16A34A','#D97706','#7C3AED','#EC4899','#0891B2','#059669','#F97316','#4B5563','#DC2626','#1D4ED8','#15803D','#B45309','#6D28D9'];

  // Keep sesionIdRef in sync
  useEffect(() => { sesionIdRef.current = sesionId; }, [sesionId]);

  // Load Leaflet from CDN once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.L) { setLeafletLoaded(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; }
      delete window.__ruteoUpdate;
    };
  }, []);

  // Global handler for popup cluster change (stable - setAsignaciones is stable)
  useEffect(() => {
    window.__ruteoUpdate = (idx, nc) => {
      setAsignaciones(prev => {
        const next = [...prev];
        next[idx] = nc;
        return next;
      });
      const sid = sesionIdRef.current;
      if (sid) supabase.from("ruteo_puntos").update({ cluster: nc, ruta: "Ruta " + (nc + 1) }).eq("sesion", sid).eq("indice", idx);
    };
  }, []);

  // Init/reinit map when points are loaded
  useEffect(() => {
    if (!leafletLoaded || puntos.length === 0 || !mapDivRef.current) return;
    const L = window.L;
    if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; }
    const map = L.map(mapDivRef.current).setView([DEPOSITO_LAT, DEPOSITO_LNG], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(map);
    const depotIcon = L.divIcon({ html: '<div style="background:#0C1425;color:white;font-size:12px;width:22px;height:22px;border-radius:4px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;">★</div>', className: "", iconSize: [22, 22], iconAnchor: [11, 11] });
    L.marker([DEPOSITO_LAT, DEPOSITO_LNG], { icon: depotIcon }).addTo(map).bindPopup("<b>Depósito / Almacén T1</b>");
    leafletMapRef.current = map;
    drawMarkers(map, puntos, asignaciones, numClusters);
    map.fitBounds(puntos.map(p => [p.lat, p.lng]), { padding: [40, 40] });
  }, [leafletLoaded, puntos]);

  // Redraw markers when assignments change
  useEffect(() => {
    if (!leafletMapRef.current || puntos.length === 0) return;
    drawMarkers(leafletMapRef.current, puntos, asignaciones, numClusters);
  }, [asignaciones]);

  const drawMarkers = (map, pts, assigns, nk) => {
    const L = window.L;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    pts.forEach((p, i) => {
      const cl = assigns[i] ?? 0;
      const color = RCOLORS[cl % RCOLORS.length];
      const icon = L.divIcon({ html: `<div style="background:${color};color:white;font-size:9px;font-weight:700;width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;">${cl + 1}</div>`, className: "", iconSize: [18, 18], iconAnchor: [9, 9] });
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
      marker.on("click", () => {
        const cont = document.createElement("div");
        cont.style.cssText = "font-family:sans-serif;min-width:185px;";
        cont.innerHTML = `<div style="font-size:13px;font-weight:700;margin-bottom:5px;">Punto ${i + 1}</div><div style="font-size:11px;color:#777;margin-bottom:10px;">${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</div><label style="font-size:11px;font-weight:600;display:block;margin-bottom:4px;">Reasignar cluster:</label><select id="rs${i}" style="width:100%;padding:5px 6px;border-radius:5px;border:1px solid #ddd;font-size:12px;margin-bottom:8px;">${Array.from({ length: nk }, (_, ci) => `<option value="${ci}"${ci === cl ? " selected" : ""}>Ruta ${ci + 1}</option>`).join("")}</select><button onclick="const s=document.getElementById('rs${i}');window.__ruteoUpdate(${i},parseInt(s.value));this.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button').click();" style="width:100%;padding:7px;border-radius:5px;border:none;background:#16A34A;color:white;font-size:12px;font-weight:700;cursor:pointer;">✓ Guardar cambio</button>`;
        marker.bindPopup(L.popup({ maxWidth: 230 }).setContent(cont)).openPopup();
      });
      markersRef.current.push(marker);
    });
  };

  // KMeans++ implementation
  const kMeans = (pts, k) => {
    if (!pts.length || k < 1) return [];
    const C = [{ ...pts[Math.floor(Math.random() * pts.length)] }];
    while (C.length < k) {
      const dists = pts.map(p => Math.min(...C.map(c => (p.lat - c.lat) ** 2 + (p.lng - c.lng) ** 2)));
      const total = dists.reduce((s, d) => s + d, 0);
      let r = Math.random() * total, chosen = pts[pts.length - 1];
      for (let j = 0; j < pts.length; j++) { r -= dists[j]; if (r <= 0) { chosen = pts[j]; break; } }
      C.push({ lat: chosen.lat, lng: chosen.lng });
    }
    let assigns = new Array(pts.length).fill(0);
    for (let it = 0; it < 200; it++) {
      const na = pts.map(p => { let md = Infinity, nr = 0; C.forEach((c, ci) => { const d = (p.lat - c.lat) ** 2 + (p.lng - c.lng) ** 2; if (d < md) { md = d; nr = ci; } }); return nr; });
      if (na.every((a, i) => a === assigns[i])) break;
      assigns = na;
      for (let ci = 0; ci < k; ci++) { const cp = pts.filter((_, i) => assigns[i] === ci); if (cp.length) C[ci] = { lat: cp.reduce((s, p) => s + p.lat, 0) / cp.length, lng: cp.reduce((s, p) => s + p.lng, 0) / cp.length }; }
    }
    return assigns;
  };

  const handleFile = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setMsg(""); setPuntos([]); setAsignaciones([]);
    try {
      let rows = [];
      if (file.name.toLowerCase().endsWith(".csv")) {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        rows = lines.slice(1).map(l => { const v = l.split(",").map(x => x.trim().replace(/^"|"$/g, "")); const o = {}; headers.forEach((h, i) => o[h] = v[i] || ""); return o; });
      } else {
        const XLSX = await import("xlsx");
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
        rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      }
      const sample = rows[0] || {};
      const latK = Object.keys(sample).find(k => /latit/i.test(k)) || "Latitud";
      const lngK = Object.keys(sample).find(k => /longit|^lng$/i.test(k)) || "Longitud";
      const pts = rows.map((r, i) => ({ ...r, lat: parseFloat(r[latK]) || 0, lng: parseFloat(r[lngK]) || 0, _i: i })).filter(p => p.lat !== 0 && p.lng !== 0);
      if (!pts.length) { setMsg("Sin coordenadas válidas. Verifica que el archivo tenga columnas 'Latitud' y 'Longitud'."); setLoading(false); return; }
      const k = Math.min(numClusters, pts.length);
      const assigns = kMeans(pts, k);
      setPuntos(pts);
      setAsignaciones(assigns);
      const sid = "S" + Date.now();
      setSesionId(sid);
      const dbRows = pts.map((p, i) => ({ sesion: sid, indice: i, latitud: p.lat, longitud: p.lng, cluster: assigns[i], ruta: "Ruta " + (assigns[i] + 1), datos_extra: JSON.stringify(Object.fromEntries(Object.entries(p).filter(([k]) => !["lat", "lng", "_i"].includes(k)))) }));
      await supabase.from("ruteo_puntos").insert(dbRows);
      setMsg(`✓ ${pts.length} puntos clusterizados en ${k} rutas.`);
    } catch (err) { setMsg("Error: " + err.message); }
    setLoading(false);
  };

  const reCluster = () => {
    if (!puntos.length) return;
    const k = Math.min(numClusters, puntos.length);
    const assigns = kMeans(puntos, k);
    setAsignaciones(assigns);
    setMsg(`✓ Re-clusterizado con ${k} rutas.`);
  };

  const exportCSV = () => {
    if (!puntos.length) return;
    const extraK = Object.keys(puntos[0]).filter(k => !["lat", "lng", "_i"].includes(k));
    const hdr = ["Ruta", "Cluster", "Latitud", "Longitud", ...extraK];
    const body = puntos.map((p, i) => {
      const cl = asignaciones[i] ?? 0;
      return [`"Ruta ${cl + 1}"`, cl + 1, p.lat, p.lng, ...extraK.map(k => `"${(p[k] || "").toString().replace(/"/g, '""')}"`).join(",")].join(",");
    });
    const csv = [hdr.join(","), ...body].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    a.download = "ruteo_clusters.csv";
    a.click();
  };

  const clusterCount = {};
  asignaciones.forEach(c => { clusterCount[c] = (clusterCount[c] || 0) + 1; });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Ruteo y Clusterización</h1>
          <p style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>Carga coordenadas · K-Means++ automático · Reasignación manual en mapa · Exportar CSV</p>
        </div>
        {puntos.length > 0 && (
          <button onClick={exportCSV} style={{ padding: "9px 20px", borderRadius: 8, border: "none", backgroundColor: C.green, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <IC.Download /> Exportar CSV
          </button>
        )}
      </div>

      {/* Controls panel */}
      <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 20, border: "1px solid " + C.border, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 14, alignItems: "flex-end", marginBottom: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Archivo de coordenadas (.csv o .xlsx)</label>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 13, boxSizing: "border-box", backgroundColor: "#FAFBFF" }} />
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>Columnas requeridas: <b>Latitud</b> y <b>Longitud</b>. El resto se conserva en la exportación.</div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Número de rutas (k)</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="number" min="2" max="15" value={numClusters} onChange={e => setNumClusters(Math.max(2, Math.min(15, parseInt(e.target.value) || 2)))} style={{ width: 80, padding: "9px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 16, fontWeight: 700, boxSizing: "border-box", textAlign: "center" }} />
              {puntos.length > 0 && (
                <button onClick={reCluster} style={{ padding: "9px 14px", borderRadius: 6, border: "1px solid " + C.accent, backgroundColor: C.accentLight, color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>↻ Re-clusterizar</button>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Depósito fijo</div>
            <div style={{ fontSize: 12, color: C.textMuted, padding: "9px 12px", borderRadius: 6, border: "1px solid " + C.border, backgroundColor: "#FAFBFF", whiteSpace: "nowrap" }}>★ 19.3989, -99.1168</div>
          </div>
        </div>
        {loading && <div style={{ fontSize: 13, color: C.blue, fontWeight: 600, padding: "8px 0" }}>⏳ Procesando archivo y generando clusters K-Means++...</div>}
        {msg && <div style={{ fontSize: 13, fontWeight: 600, padding: "10px 14px", borderRadius: 8, backgroundColor: msg.startsWith("✓") ? C.greenBg : C.redBg, color: msg.startsWith("✓") ? C.green : C.red }}>{msg}</div>}
      </div>

      {puntos.length > 0 && (
        <>
          {/* Stats */}
          <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            <StatCard label="Total puntos" value={puntos.length.toString()} icon={<IC.MapPin />} color={C.blue} />
            <StatCard label="Rutas generadas" value={Object.keys(clusterCount).length.toString()} icon={<IC.BarChart />} color={C.accent} />
            <StatCard label="Promedio por ruta" value={Object.keys(clusterCount).length > 0 ? Math.round(puntos.length / Object.keys(clusterCount).length).toString() : "0"} subvalue="puntos por cluster" icon={<IC.Package />} color={C.green} />
            <StatCard label="Sesión ID" value={sesionId.substring(0, 10)} subvalue="guardado en BD" icon={<IC.Clock />} color={C.textMuted} />
          </div>

          {/* Cluster legend */}
          <div style={{ backgroundColor: C.white, borderRadius: 12, padding: "12px 18px", border: "1px solid " + C.border, marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text, marginRight: 4 }}>Rutas:</span>
            {Object.entries(clusterCount).sort((a, b) => +a[0] - +b[0]).map(([cl, cnt]) => (
              <div key={cl} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 12px", borderRadius: 16, backgroundColor: RCOLORS[+cl % RCOLORS.length] + "18", border: "1px solid " + RCOLORS[+cl % RCOLORS.length] + "40" }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: RCOLORS[+cl % RCOLORS.length] }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: RCOLORS[+cl % RCOLORS.length] }}>Ruta {+cl + 1}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>{cnt} pts</span>
              </div>
            ))}
          </div>

          {/* Map */}
          <div style={{ backgroundColor: C.white, borderRadius: 12, border: "1px solid " + C.border, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "11px 18px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Mapa interactivo de clusters</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>Clic en marcador → seleccionar ruta → Guardar (se persiste en BD)</div>
            </div>
            <div ref={mapDivRef} style={{ height: 480, width: "100%" }} />
          </div>

          {/* Table */}
          <div style={{ backgroundColor: C.white, borderRadius: 12, border: "1px solid " + C.border, overflow: "hidden" }}>
            <div style={{ padding: "11px 18px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Tabla de asignaciones</span>
              <span style={{ fontSize: 12, color: C.textMuted }}>{puntos.length} puntos · cambios en dropdown se guardan en Supabase</span>
            </div>
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: C.bg, zIndex: 1 }}>
                  <tr>
                    {["#", "Latitud", "Longitud", "Cluster / Ruta", ""].map(h => (
                      <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {puntos.map((p, i) => {
                    const cl = asignaciones[i] ?? 0;
                    const color = RCOLORS[cl % RCOLORS.length];
                    return (
                      <tr key={i} style={{ borderTop: "1px solid " + C.border }}
                        onMouseEnter={ev => ev.currentTarget.style.backgroundColor = "#FAFBFF"}
                        onMouseLeave={ev => ev.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={{ padding: "7px 14px", fontSize: 12, color: C.textMuted }}>{i + 1}</td>
                        <td style={{ padding: "7px 14px", fontSize: 12 }}>{p.lat.toFixed(6)}</td>
                        <td style={{ padding: "7px 14px", fontSize: 12 }}>{p.lng.toFixed(6)}</td>
                        <td style={{ padding: "7px 14px" }}>
                          <select value={cl} onChange={e => {
                            const nc = parseInt(e.target.value);
                            setAsignaciones(prev => { const n = [...prev]; n[i] = nc; return n; });
                            if (sesionId) supabase.from("ruteo_puntos").update({ cluster: nc, ruta: "Ruta " + (nc + 1) }).eq("sesion", sesionId).eq("indice", i);
                          }} style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600, color, cursor: "pointer", backgroundColor: color + "12" }}>
                            {Array.from({ length: numClusters }, (_, ci) => <option key={ci} value={ci}>Ruta {ci + 1}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "7px 14px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 4, backgroundColor: color + "18", color }}>Ruta {cl + 1}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {puntos.length === 0 && !loading && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 48, border: "1px solid " + C.border, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>Carga un archivo para generar rutas</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>CSV o Excel con columnas <b>Latitud</b> y <b>Longitud</b>. El algoritmo K-Means++ asigna automáticamente cada punto a la ruta más cercana.</div>
          <div style={{ fontSize: 11, color: C.textMuted, backgroundColor: C.bg, padding: "14px 20px", borderRadius: 8, display: "inline-block", textAlign: "left", maxWidth: 560 }}>
            <b>SQL requerido en Supabase:</b>
            <pre style={{ fontSize: 10, marginTop: 8, whiteSpace: "pre-wrap", color: C.text }}>{`CREATE TABLE ruteo_puntos (
  id bigserial PRIMARY KEY,
  sesion text,
  indice int,
  latitud float8,
  longitud float8,
  cluster int,
  ruta text,
  datos_extra jsonb,
  created_at timestamptz DEFAULT now()
);`}</pre>
          </div>
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
      case "ruteo": return <ModuleRuteo />;
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