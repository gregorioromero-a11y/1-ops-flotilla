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
    { id: "asignaciones", label: "Asignaciones", icon: IC.ClipboardCheck, badge: "Nuevo" },
    { id: "manifiesto", label: "Manifiesto", icon: IC.ClipboardCheck, badge: "Nuevo" },
    { id: "consultas", label: "Consultas", icon: IC.BarChart, badge: "Nuevo" },
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
  const [filterProveedor, setFilterProveedor] = useState("Todos");
  const [filterOperador, setFilterOperador] = useState("Todos");
  const [filterOperacion, setFilterOperacion] = useState("Todas");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  // Default: ayer (día vencido)
  const ayerStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  })();
  const [fechaDesde, setFechaDesde] = useState(ayerStr);
  const [fechaHasta, setFechaHasta] = useState(ayerStr);
  const [fechasIniciadas, setFechasIniciadas] = useState(true);
  const [modoRango, setModoRango] = useState(false);

  const shiftDay = (delta) => {
    const [y, m, d] = fechaDesde.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + delta);
    const nueva = date.toISOString().split("T")[0];
    setFechaDesde(nueva);
    setFechaHasta(nueva);
    setModoRango(false);
  };
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [costosData, setCostosData] = useState([]);
  const [asistencia, setAsistencia] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [operadoresCatalogo, setOperadoresCatalogo] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualMsg, setManualMsg] = useState("");
  const [prefactOpen, setPrefactOpen] = useState(false);
  const [prefactProveedor, setPrefactProveedor] = useState("");
  const [prefactIVA, setPrefactIVA] = useState(true);
  const [prefactOperaciones, setPrefactOperaciones] = useState([]);
  const blankManual = () => ({
    fecha: ayerStr,
    tipoRuta: "Última milla",
    carrier: "",
    operador: "",
    tipoUnidad: "",
    costoUnidad: "",
    total: 0,
    entregados: 0,
    intentados: 0,
    noVisitados: 0,
    recolecciones: 0,
    placa: "",
    correo: "",
    economico: "",
    almacen: "T1 ENVIOS",
  });
  const [manualForm, setManualForm] = useState(blankManual());

  // Load rutas and costos when date changes
  useEffect(() => { loadRutas(); loadCostos(); loadAsistenciaCarriers(); }, [fechaDesde, fechaHasta]);

  // Auto-refrescar al volver a la pestaña — evita datos viejos cuando un
  // operador acaba de registrar asistencia desde /checkin u otra PC
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        loadRutas(); loadCostos(); loadAsistenciaCarriers();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [fechaDesde, fechaHasta]);

  const loadCostos = async () => {
    const { data } = await supabase.from("costos").select("*").gte("fecha", fechaDesde).lte("fecha", fechaHasta);
    setCostosData(data || []);
  };

  const loadAsistenciaCarriers = async () => {
    // Keyset pagination on id (unique PK) so no duplicates or gaps.
    const byId = new Map();
    const pageSize = 1000;
    let cursor = null;
    while (true) {
      let q = supabase.from("asistencia").select("*").order("id", { ascending: false }).limit(pageSize);
      if (cursor !== null) q = q.lt("id", cursor);
      const { data: chunk } = await q;
      if (!chunk || chunk.length === 0) break;
      for (const row of chunk) byId.set(row.id, row);
      if (chunk.length < pageSize) break;
      cursor = chunk[chunk.length - 1].id;
    }
    const allAsistencia = Array.from(byId.values()).sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "") || b.id - a.id);
    // Paginación por keyset para operadores (Supabase tope 1000 filas)
    const loadAllOps = async () => {
      const m = new Map();
      let cur = null;
      while (true) {
        let q = supabase.from("operadores").select("id, nombre, proveedor, tipo_licencia, activo").order("id", { ascending: false }).limit(1000);
        if (cur !== null) q = q.lt("id", cur);
        const { data: ch } = await q;
        if (!ch || ch.length === 0) break;
        for (const row of ch) m.set(row.id, row);
        if (ch.length < 1000) break;
        cur = ch[ch.length - 1].id;
      }
      return Array.from(m.values());
    };
    const [{ data: cData }, opsData] = await Promise.all([
      supabase.from("carriers").select("*"),
      loadAllOps(),
    ]);
    // IMPORTANTE: NO filtrar "Registro manual" aquí — esas filas son
    // asistencia legítima registrada desde el módulo de Asistencia Diaria
    // y deben contarse en la prefactura. Los lugares que dependen del
    // nombre real del operador (cost lookup por operador, dropdown de
    // captura manual) las descartan inline.
    setAsistencia(allAsistencia);
    setCarriers(cData || []);
    setOperadoresCatalogo((opsData || []).filter(o => o.activo !== false));
  };

  // Formula evaluator: supports +, -, *, /, parens, decimals, and `costo` variable
  const evalFormula = (expr, costo) => {
    if (!expr || !String(expr).trim()) return 0;
    let s = String(expr).replace(/costo/gi, "(" + (parseFloat(costo) || 0) + ")");
    if (!/^[\d+\-*/().\s]*$/.test(s)) return NaN;
    try {
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + s + ')')();
      return (typeof result === "number" && isFinite(result)) ? result : NaN;
    } catch { return NaN; }
  };

  // Normalize strings for operator name matching (case/accents/spaces insensitive)
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

  // Lookup unit + provider + base cost for a ruta based on matching automatic asistencia
  // record (same day + same operator name) joined with carriers catalog.
  // Special cases:
  //   - "PETCO Monterrey": flat $50 per package operated, bypasses asistencia.
  //   - Other permissible labels (PETCO, Foráneo, HalfMile): if no same-day
  //     asistencia, fallback to the operator's most-recent asistencia to
  //     resolve the unit, then pull cost from carriers catalog.
  const getCostoInfo = r => {
    // Filas sintéticas (sólo asistencia, sin ruta): el costo y el tipo_unidad
    // se inyectan en el constructor de rutasCombinadas.
    if (r && r._esAsistencia) {
      return { baseCost: r._baseCostSintetico || 0, proveedor: r.carrier, tipo_unidad: r._tipoUnidadSintetico || "Sedan", missing: false, tipo_operacion: r.tipoRuta, fromAsistencia: true };
    }
    // Flat-rate tipos (per-package): bypass asistencia lookup entirely
    const rateFija = TARIFAS_FIJAS[r.tipoRuta];
    if (rateFija != null) {
      const paqOperados = (parseInt(r.entregados) || 0) + (isCrossdock(r) ? (parseInt(r.recolecciones) || 0) : 0);
      const baseCost = rateFija * paqOperados;
      return { baseCost, proveedor: r.tipoRuta, tipo_unidad: "Tarifa fija", missing: false, flatRate: true, flatRateValue: rateFija, paqOperados };
    }
    const fecha = (r.salida || "").substring(0, 10);
    if (!fecha || !r.operador) return { baseCost: 0, proveedor: null, tipo_unidad: null, missing: true };
    const opNorm = norm(r.operador);
    // 1) Same-day match (preferred). Excluye filas "Registro manual" porque
    // representan asistencia agregada sin operador específico.
    const sameDay = asistencia.filter(a => a.nombre_operador && a.nombre_operador !== "Registro manual" && (a.fecha || "").substring(0, 10) === fecha && norm(a.nombre_operador) === opNorm);
    if (sameDay.length) {
      const a = sameDay[0];
      const car = carriers.find(c => c.proveedor === a.proveedor && c.tipo_unidad === a.tipo_unidad);
      const baseCost = parseFloat(car?.costo_unidad) || 0;
      return { baseCost, proveedor: a.proveedor, tipo_unidad: a.tipo_unidad, missing: false, tipo_operacion: a.tipo_operacion };
    }
    // 2) Fallback for permissible labels: most-recent asistencia for this operator
    if (esPermisible(r)) {
      const fallback = asistencia.filter(a => a.nombre_operador && a.nombre_operador !== "Registro manual" && norm(a.nombre_operador) === opNorm);
      if (fallback.length) {
        // asistencia is already sorted desc by fecha in loadAsistenciaCarriers
        const a = fallback[0];
        const car = carriers.find(c => c.proveedor === a.proveedor && c.tipo_unidad === a.tipo_unidad);
        const baseCost = parseFloat(car?.costo_unidad) || 0;
        return { baseCost, proveedor: a.proveedor, tipo_unidad: a.tipo_unidad, missing: false, tipo_operacion: a.tipo_operacion, fallback: "operador" };
      }
      // 3) Last-resort fallback: operator has no asistencia ever. Use the
      //    carrier from the uploaded route row to pick a default unit
      //    (prefer Sedan, else the cheapest última-milla option).
      if (r.carrier && r.carrier !== "—") {
        const carrierName = norm(r.carrier);
        const candidates = carriers.filter(c =>
          norm(c.proveedor) === carrierName
          && c.tipo_unidad && c.tipo_unidad !== "---" && c.tipo_unidad !== "—"
          && (c.operacion || "").toLowerCase().includes("ltima")
        );
        if (candidates.length) {
          const sedan = candidates.find(c => c.tipo_unidad === "Sedan");
          const chosen = sedan || candidates.slice().sort((a, b) =>
            (parseFloat(a.costo_unidad) || 0) - (parseFloat(b.costo_unidad) || 0)
          )[0];
          const baseCost = parseFloat(chosen.costo_unidad) || 0;
          return { baseCost, proveedor: chosen.proveedor, tipo_unidad: chosen.tipo_unidad, missing: false, tipo_operacion: chosen.operacion, fallback: "carrier" };
        }
      }
    }
    return { baseCost: 0, proveedor: null, tipo_unidad: null, missing: true };
  };

  const isCrossdock = r => {
    const t = (r.tipoRuta || "").toLowerCase();
    return t.includes("half") || t.includes("cross");
  };

  // Final cost after penalty.
  // The formula evaluates DIRECTLY to the new cost (costo real final).
  // The discount is derived: descuento = costo_base - costo_nuevo.
  // If the formula is empty/invalid, no penalty applies (costo_nuevo = costo_base).
  const getCostoReal = r => {
    const { baseCost } = getCostoInfo(r);
    const hasFormula = (r.penalizacion || "").trim().length > 0;
    const evaluated = evalFormula(r.penalizacion, baseCost);
    const costoNuevo = hasFormula && !isNaN(evaluated) ? evaluated : baseCost;
    const descuento = baseCost - costoNuevo;
    return { baseCost, descuento, costoNuevo };
  };

  // Cost per package (last mile uses delivered, crossdock uses collected)
  const getCostoPorPaquete = r => {
    const { costoNuevo } = getCostoReal(r);
    const divisor = isCrossdock(r) ? r.recolecciones : r.entregados;
    if (!divisor || divisor <= 0) return { value: null, divisor: 0 };
    return { value: costoNuevo / divisor, divisor };
  };

  // Tipos de ruta donde es permisible no tener registro automático de operador
  const TIPOS_PERMISIBLES = new Set(["Foráneo Puebla", "Foráneo Monterrey", "Foráneo GDL", "PETCO", "PETCO Monterrey", "HalfMile"]);
  const esPermisible = r => TIPOS_PERMISIBLES.has(r.tipoRuta);
  // Tipos de tarifa fija: { tipo: $ por paquete operado }
  const TARIFAS_FIJAS = {
    "PETCO Monterrey": 50,
    "Foráneo Monterrey": 55,
    "Foráneo GDL": 55,
  };

  // IMPORTANTE: todas las funciones de guardado trabajan por `id` de la ruta
  // (no por índice), para evitar cualquier race con cambios de filtro/orden.
  const savePenalizacion = async (id, value) => {
    if (!id) return;
    setRutas(prev => prev.map(r => r.id === id ? { ...r, penalizacion: value } : r));
    try {
      const { error } = await supabase.from("rutas").update({ penalizacion: value }).eq("id", id);
      if (error && /does not exist|schema cache/i.test(error.message)) {
        alert("⚠ Falta agregar la columna 'penalizacion' en la tabla rutas. SQL: ALTER TABLE rutas ADD COLUMN penalizacion text;");
        console.warn("SQL:\nALTER TABLE rutas ADD COLUMN penalizacion text;");
      }
    } catch {}
  };

  const saveRecolecciones = async (id, value) => {
    if (!id) return;
    const v = Math.max(0, parseInt(value) || 0);
    setRutas(prev => prev.map(r => r.id === id ? { ...r, recolecciones: v } : r));
    await supabase.from("rutas").update({ recolecciones: v }).eq("id", id);
  };

  const saveNota = async (id, value) => {
    if (!id) return;
    setRutas(prev => prev.map(r => r.id === id ? { ...r, nota: value } : r));
    try {
      const { error } = await supabase.from("rutas").update({ nota: value }).eq("id", id);
      if (error && /does not exist|schema cache/i.test(error.message)) {
        alert("⚠ Falta agregar la columna 'nota' en la tabla rutas. SQL: ALTER TABLE rutas ADD COLUMN nota text;");
        console.warn("SQL:\nALTER TABLE rutas ADD COLUMN nota text;");
      }
    } catch {}
  };

  const loadRutas = async () => {
    setLoading(true);
    // Supabase caps a single select at 1000 rows. Use keyset pagination on
    // `id` (unique PK, monotonically increasing) instead of offset-based to
    // guarantee no duplicates or gaps even across concurrent writes. Final
    // Map-based dedup by id is a belt-and-suspenders safety net.
    const byId = new Map();
    const pageSize = 1000;
    let cursor = null;
    while (true) {
      let q = supabase.from("rutas").select("*").order("id", { ascending: false }).limit(pageSize);
      if (cursor !== null) q = q.lt("id", cursor);
      const { data: chunk } = await q;
      if (!chunk || chunk.length === 0) break;
      for (const row of chunk) byId.set(row.id, row);
      if (chunk.length < pageSize) break;
      cursor = chunk[chunk.length - 1].id;
    }
    const data = Array.from(byId.values()).sort((a, b) => (a.created_at || "").localeCompare(b.created_at || "") * -1 || b.id - a.id);
    if (data && data.length > 0) {
      // First load: auto-adjust date range to the min/max of available data
      if (!fechasIniciadas) {
        const fechas = data.map(r => (r.fecha_salida || r.fecha_registro || "").substring(0, 10)).filter(f => f.length === 10).sort();
        if (fechas.length > 0) {
          setFechaDesde(fechas[0]);
          setFechaHasta(fechas[fechas.length - 1]);
        }
        setFechasIniciadas(true);
      }
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
        penalizacion: r.penalizacion || "",
        nota: r.nota || "",
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

  const deleteRuta = (rOrIndex) => {
    // Acepta el objeto ruta directamente o un index del array `rutas`.
    // Las sintéticas (_esAsistencia) se eliminan de la tabla `asistencia`,
    // no de `rutas`.
    const r = (typeof rOrIndex === "number") ? rutas[rOrIndex] : rOrIndex;
    if (!r) return;
    setOpenMenu(null);
    const esAsis = r._esAsistencia;
    setConfirmModal({
      message: esAsis
        ? `¿Eliminar el registro de asistencia de ${r.operador || "operador"} del ${(r.salida || "").substring(0,10)}? Se borrará de Registro Diario.`
        : `¿Eliminar la ruta de ${r.operador || "operador desconocido"}?`,
      onConfirm: async () => {
        if (esAsis && r.asistenciaId) {
          const { error } = await supabase.from("asistencia").delete().eq("id", r.asistenciaId);
          if (error) { alert("Error al eliminar asistencia: " + error.message); return; }
        } else if (r.id) {
          const { error } = await supabase.from("rutas").delete().eq("id", r.id);
          if (error) { alert("Error al eliminar: " + error.message); return; }
        }
        await Promise.all([loadRutas(), loadAsistenciaCarriers()]);
      },
    });
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

  const bulkDelete = () => {
    // Custom modal — window.confirm() can be permanently suppressed by the
    // browser if the user unchecked "show again" on a prior prompt, which
    // made the native dialog return false without asking.
    const ids = [...selectedRows].map(idx => filtered[idx]).filter(r => r && r.id).map(r => r.id);
    if (ids.length === 0) { setSelectedRows(new Set()); return; }
    setConfirmModal({
      message: `¿Eliminar ${ids.length} ruta${ids.length === 1 ? "" : "s"} seleccionada${ids.length === 1 ? "" : "s"}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        const chunkSize = 200;
        let failed = 0;
        for (let i = 0; i < ids.length; i += chunkSize) {
          const slice = ids.slice(i, i + chunkSize);
          const { error } = await supabase.from("rutas").delete().in("id", slice);
          if (error) { console.error("bulkDelete error:", error); failed += slice.length; }
        }
        if (failed > 0) alert(`No se pudieron eliminar ${failed} de ${ids.length} rutas. Revisa la consola.`);
        setSelectedRows(new Set());
        await loadRutas();
      },
    });
  };

  // Operadores únicos por carrier — combina catálogo `operadores` + historial
  // de `asistencia`. La clave del proveedor se normaliza para que diferencias
  // de mayúsculas/acentos/espacios entre tablas (ej: "Cotremex" vs "COTREMEX")
  // no escondan operadores válidos.
  const operadoresPorCarrier = (() => {
    const map = {};
    const add = (proveedorRaw, info) => {
      if (!proveedorRaw || !info.nombre) return;
      const key = norm(proveedorRaw);
      if (!map[key]) map[key] = new Map();
      const opKey = norm(info.nombre);
      const existing = map[key].get(opKey);
      if (!existing) {
        map[key].set(opKey, info);
      } else {
        // Enriquecer si la fuente nueva trae datos faltantes
        map[key].set(opKey, {
          nombre: existing.nombre,
          tipo_unidad: existing.tipo_unidad || info.tipo_unidad,
          placa: existing.placa || info.placa,
          correo: existing.correo || info.correo,
        });
      }
    };
    operadoresCatalogo.forEach(o => add(o.proveedor, {
      nombre: o.nombre, tipo_unidad: "", placa: "", correo: "",
    }));
    asistencia.forEach(a => {
      // No usar entradas "Registro manual" como nombres de operadores reales
      if (!a.nombre_operador || a.nombre_operador === "Registro manual") return;
      add(a.proveedor, {
        nombre: a.nombre_operador, tipo_unidad: a.tipo_unidad || "",
        placa: a.placa || "", correo: a.correo || "",
      });
    });
    return map;
  })();
  const getOperadoresFor = (proveedor) => operadoresPorCarrier[norm(proveedor)] || new Map();

  // Costo default para (proveedor, tipo_unidad) desde carriers
  const defaultCostoFor = (proveedor, tipo) => {
    const c = carriers.find(x => x.proveedor === proveedor && x.tipo_unidad === tipo);
    return c ? (parseFloat(c.costo_unidad) || 0) : 0;
  };

  const saveManualRuta = async () => {
    const f = manualForm;
    if (!f.fecha || !f.carrier || !f.operador) {
      setManualMsg("⚠ Faltan campos requeridos: fecha, transportista y operador.");
      return;
    }
    const total = (parseInt(f.entregados) || 0) + (parseInt(f.intentados) || 0) + (parseInt(f.noVisitados) || 0);
    const entregados = parseInt(f.entregados) || 0;
    const pct = total > 0 ? Math.round((entregados / total) * 1000) / 10 : 0;
    setManualSaving(true);
    setManualMsg("");
    try {
      // 1) Insertar ruta
      const insertRow = {
        id_ruta: "MAN-" + Date.now(),
        carrier: f.carrier,
        operador: f.operador,
        correo_operador: f.correo || "",
        placa: f.placa || "",
        almacen: f.almacen || "T1 ENVIOS",
        economico: f.economico || "",
        status: "Completada",
        total,
        entregados,
        recolecciones: parseInt(f.recolecciones) || 0,
        pct_entrega: pct,
        intentados: parseInt(f.intentados) || 0,
        no_visitados: parseInt(f.noVisitados) || 0,
        fecha_salida: f.fecha + "T08:00:00",
        intercambios: 0,
        tipo_ruta: f.tipoRuta,
        km_estimados: "—",
        km_recorridos: "—",
        tiempo_estimado: "—",
        tiempo_real: "—",
        fecha_registro: f.fecha,
      };
      const { error: e1 } = await supabase.from("rutas").insert([insertRow]);
      if (e1) throw e1;

      // 2) Asegurar registro en asistencia (mismo día + operador) para que
      //    getCostoInfo encuentre el match y calcule el costo real.
      const fechaIso = f.fecha;
      const yaExiste = asistencia.some(a => (a.fecha || "").substring(0, 10) === fechaIso && norm(a.nombre_operador) === norm(f.operador) && a.proveedor === f.carrier);
      if (!yaExiste && f.tipoUnidad) {
        const { error: e2 } = await supabase.from("asistencia").insert([{
          fecha: fechaIso,
          nombre_operador: f.operador,
          proveedor: f.carrier,
          tipo_unidad: f.tipoUnidad,
          placa: f.placa || null,
          correo: f.correo || null,
          tipo_operacion: f.tipoRuta,
        }]);
        if (e2) console.warn("No se pudo registrar asistencia automática:", e2.message);
      }

      setManualMsg(`✓ Ruta capturada (${entregados} entregados de ${total}).`);
      setManualForm(blankManual());
      await Promise.all([loadRutas(), loadAsistenciaCarriers()]);
      setTimeout(() => { setManualMsg(""); setManualOpen(false); }, 1500);
    } catch (err) {
      setManualMsg("Error al guardar: " + (err?.message || err));
    }
    setManualSaving(false);
  };

  // Lista de proveedores con RUTAS en el periodo (sólo del Excel).
  // La prefactura no usa asistencia, así que aquí tampoco.
  const proveedoresEnPeriodo = (() => {
    const counts = new Map();
    const tally = (raw) => {
      if (!raw || raw === "—") return;
      const key = norm(raw);
      if (!key) return;
      if (!counts.has(key)) counts.set(key, new Map());
      counts.get(key).set(raw, (counts.get(key).get(raw) || 0) + 1);
    };
    rutas.forEach(r => {
      const f = (r.salida || "").substring(0, 10);
      if (f >= fechaDesde && f <= fechaHasta) tally(r.carrier);
    });
    const finales = [];
    counts.forEach(variants => {
      let best = null, bestCount = -1;
      variants.forEach((count, name) => {
        const isUpperWin = count === bestCount && name === name.toUpperCase() && best && best !== best.toUpperCase();
        if (count > bestCount || isUpperWin) { best = name; bestCount = count; }
      });
      if (best) finales.push(best);
    });
    return finales.sort();
  })();

  // 7 operaciones canónicas — siempre se muestran en el popup
  const OPERACIONES_CANONICAS = [
    "Última milla",
    "Crossdock",
    "PETCO",
    "PETCO Monterrey",
    "Foráneo Puebla",
    "Foráneo Monterrey",
    "Foráneo GDL",
  ];

  // Mapea variantes de nombres (capitalización, acentos, alias) al canónico.
  // CrossDock + Logística Inversa cuentan como Crossdock.
  // Reusa `norm` (definida arriba) que usa el rango Unicode correcto
  // ̀-ͯ para quitar acentos de forma confiable.
  const normalizeOperacion = (raw) => {
    if (!raw) return "Sin especificar";
    const n = norm(raw);
    if (n.includes("ultima milla") || n === "lm" || n === "um") return "Última milla";
    if (n.includes("crossdock") || n.includes("cross dock") || n.includes("logistica inversa") || n.includes("halfmile") || n.includes("half mile") || n.includes("logistica") || n.includes("inversa")) return "Crossdock";
    if (n.includes("petco") && n.includes("monterrey")) return "PETCO Monterrey";
    if (n.includes("petco")) return "PETCO";
    if (n.includes("foraneo")) {
      if (n.includes("monterrey") || n.includes("mty")) return "Foráneo Monterrey";
      if (n.includes("gdl") || n.includes("guadalajara")) return "Foráneo GDL";
      if (n.includes("puebla")) return "Foráneo Puebla";
      return "Foráneo Puebla"; // default si sólo dice "Foráneo"
    }
    return raw; // mantener cualquier otro tal cual
  };

  // Tipos de operación disponibles para un proveedor en el periodo:
  // siempre devuelve las 7 canónicas en orden fijo (incluso con cuenta 0)
  // para que el usuario vea lo que existe y lo que no.
  const operacionesParaProveedor = () => OPERACIONES_CANONICAS;

  // Dedup: misma unidad (operador real) en mismo (proveedor, fecha, tipo_unidad,
  // operación canónica) cuenta UNA vez aunque exista bajo varios labels en BD
  // (típico: el mismo operador registrado como "CrossDock" y "Logística Inversa").
  // Para filas "Registro manual" cada fila vale 1 (es una cuenta agregada, no
  // un operador único).
  const dedupAsistencia = (rows) => {
    const seen = new Set();
    const out = [];
    rows.forEach(a => {
      const op = normalizeOperacion(a.tipo_operacion);
      if (!a.nombre_operador || a.nombre_operador === "Registro manual") {
        out.push(a);
        return;
      }
      const f = (a.fecha || "").substring(0, 10);
      const key = `${a.nombre_operador}|${f}|${a.tipo_unidad || ""}|${op}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(a);
    });
    return out;
  };

  // El conteo y la prefactura usan EXCLUSIVAMENTE las rutas cargadas del
  // Excel (tabla `rutas`). El Registro Diario (asistencia) NO influye en
  // la prefactura — sólo se usa visualmente en la tabla de Registrar Envíos
  // como "asistencias sin ruta" (filas sintéticas con badge ASISTENCIA),
  // pero la prefactura las ignora por completo.
  //
  // Para inferir el tipo_unidad cuando getCostoInfo no lo encuentra (operador
  // sin asistencia + operación no permisible), busca en el catálogo carriers
  // del proveedor. Si el proveedor sólo tiene UN tipo en esa operación, usa
  // ese. Si tiene varios, el más barato. NUNCA hardcodear "Sedan" — ADET por
  // ejemplo no tiene Sedan, eso creaba columnas fantasma en el PDF.
  const unidadesEnvios = (provNorm, opsPermitidas) => {
    const out = [];
    const ignoradas = [];
    const debug = []; // diagnóstico exhaustivo
    rutas.forEach(r => {
      const f = (r.salida || "").substring(0, 10);
      if (!f || f < fechaDesde || f > fechaHasta) return;
      const carrierMatch = norm(r.carrier) === provNorm;
      if (!carrierMatch) {
        const info = getCostoInfo(r);
        if (!(info && info.proveedor && norm(info.proveedor) === provNorm)) return;
      }
      const opCanonica = normalizeOperacion(r.tipoRuta);
      if (opCanonica === "Sin especificar") return;
      if (opsPermitidas && !opsPermitidas.has(opCanonica)) return;
      const info = getCostoInfo(r);
      let baseCost = parseFloat(info.baseCost) || 0;
      let tipo_unidad = info.tipo_unidad;

      // 1) Validar tipo_unidad contra catálogo del proveedor. Si la
      //    asistencia dice "Moto" pero Partrunner sólo tiene Sedan, el
      //    dato de asistencia está mal — forzar el fallback al catálogo.
      if (tipo_unidad) {
        const existeEnCatalogo = carriers.some(c =>
          norm(c.proveedor) === provNorm && c.tipo_unidad === tipo_unidad
        );
        if (!existeEnCatalogo) {
          tipo_unidad = null;
          baseCost = 0; // el costo viejo correspondía al tipo inválido
        }
      }

      // 2) Fallback al catálogo cuando NO hay asistencia matching o cuando
      //    la asistencia es inconsistente. La regla del usuario:
      //    "el mandatorio será siempre el registro de envíos" — si una ruta
      //    no tiene asistencia, igual se cuenta usando el catálogo.
      if (!tipo_unidad || baseCost === 0) {
        const opMatchCarrier = (cOp) => {
          const o = (cOp || "").toLowerCase();
          if (opCanonica === "Última milla") return o.includes("ltima");
          if (opCanonica === "Crossdock") return o.includes("cross") || o.includes("inversa") || o.includes("half");
          if (opCanonica.startsWith("PETCO")) return o.includes("petco");
          if (opCanonica.startsWith("Foráneo")) return o.includes("foraneo") || o.includes("foráneo") || o.includes("ltima");
          return true;
        };
        const candidates = carriers.filter(c =>
          norm(c.proveedor) === provNorm
          && c.tipo_unidad && c.tipo_unidad !== "---" && c.tipo_unidad !== "—"
          && opMatchCarrier(c.operacion)
        );
        let chosen = null;
        if (candidates.length === 1) chosen = candidates[0];
        else if (candidates.length > 1) {
          chosen = candidates.slice().sort((a, b) =>
            (parseFloat(a.costo_unidad) || 0) - (parseFloat(b.costo_unidad) || 0)
          )[0];
        }
        if (chosen) {
          if (!tipo_unidad) tipo_unidad = chosen.tipo_unidad;
          if (baseCost === 0) baseCost = parseFloat(chosen.costo_unidad) || 0;
        }
      }

      // 3) Recalcular costoNuevo con el baseCost final (ya considerando
      //    el catálogo). Aplicar penalización si la hay.
      const hasFormula = (r.penalizacion || "").trim().length > 0;
      const evaluated = evalFormula(r.penalizacion, baseCost);
      const costoNuevo = hasFormula && !isNaN(evaluated) ? evaluated : baseCost;

      debug.push({ idRuta: r.id, fecha: f, operador: r.operador, info_baseCost: info.baseCost, info_tipo: info.tipo_unidad, baseCost_final: baseCost, tipo_unidad_final: tipo_unidad, costoNuevo });

      if (!tipo_unidad) {
        ignoradas.push({ id: r.id, operador: r.operador, fecha: f, tipoRuta: r.tipoRuta, razon: "sin tipo_unidad ni catálogo del proveedor que matchee" });
        return;
      }

      // REGLA: si el costo final (después de penalización) es 0 o negativo,
      // NO se cuenta como unidad. Aplica para penalizaciones al 100% sobre
      // baseCost > 0 (caso ADET 22 abr).
      if (costoNuevo <= 0) {
        ignoradas.push({ id: r.id, operador: r.operador, fecha: f, tipoRuta: r.tipoRuta, razon: baseCost === 0 ? "sin asistencia y sin catálogo con costo" : `penalización lleva costoNuevo a ${costoNuevo}` });
        return;
      }
      out.push({ fecha: f, tipo_unidad, opCanonica });
    });
    if (typeof window !== "undefined") {
      // Marcar cada fila del debug con la decisión final
      const outIds = new Set(debug.map(d => d.idRuta).filter((_, i, arr) => out[i] !== undefined));
      const decisionados = debug.map(d => {
        const fueOut = out.some(u => u.fecha === d.fecha && u.tipo_unidad === d.info_tipo_unidad);
        const fueIgnorada = ignoradas.find(ig => ig.id === d.idRuta);
        return { ...d, decision: fueIgnorada ? `IGNORADA: ${fueIgnorada.razon}` : "CONTADA" };
      });
      console.group(`[Prefactura DEBUG] provNorm="${provNorm}" — ${debug.length} rutas evaluadas, ${out.length} contadas, ${ignoradas.length} ignoradas`);
      console.table(decisionados);
      console.groupEnd();
    }
    return out;
  };

  const conteoOperacion = (proveedor, opCanonica) => {
    if (!proveedor || !opCanonica) return 0;
    return unidadesEnvios(norm(proveedor), new Set([opCanonica])).length;
  };

  const generatePrefactura = (proveedor, conIVA, operacionesFiltro) => {
    if (!proveedor) return;
    // Las operaciones del filtro vienen como canónicas (Crossdock incluye
    // CrossDock + Logística Inversa, etc.).
    const opsPermitidas = (operacionesFiltro && operacionesFiltro.length > 0) ? new Set(operacionesFiltro) : null;
    const provNorm = norm(proveedor);

    // 1) Recolectar unidades desde lo que aparece en Registrar Envíos
    //    (rutas reales + asistencias sintéticas). Mismo source que la tabla
    //    para garantizar consistencia visual ↔ prefactura.
    const unidades = unidadesEnvios(provNorm, opsPermitidas);

    // 2) Costo por tipo_unidad desde catálogo carriers
    const costoPorTipo = {};
    const tiposSet = new Set();
    unidades.forEach(u => { if (u.tipo_unidad) tiposSet.add(u.tipo_unidad); });
    tiposSet.forEach(t => {
      const car = carriers.find(c => norm(c.proveedor) === provNorm && c.tipo_unidad === t);
      costoPorTipo[t] = car ? (parseFloat(car.costo_unidad) || 0) : 0;
    });
    const tipos = [...tiposSet].sort();

    // 3) Construir lista de fechas del rango (incluye días sin asistencia)
    const fechas = [];
    const start = new Date(fechaDesde + "T12:00:00");
    const end = new Date(fechaHasta + "T12:00:00");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      fechas.push(d.toISOString().substring(0, 10));
    }
    // 4) Conteos por (fecha, tipo) — combina filtrada + extraDeRutas
    const conteos = {};
    fechas.forEach(f => { conteos[f] = {}; tipos.forEach(t => { conteos[f][t] = 0; }); });
    unidades.forEach(u => {
      if (conteos[u.fecha] && u.tipo_unidad) conteos[u.fecha][u.tipo_unidad] = (conteos[u.fecha][u.tipo_unidad] || 0) + 1;
    });

    // 5) Penalizaciones + notas por fecha — sólo de rutas reales (las
    //    sintéticas no tienen penalizacion ni nota). Match por proveedor
    //    normalizado y tipo_ruta normalizado. Las notas se procesan
    //    independientemente del costo: si una ruta tiene costo 0 pero
    //    tiene nota, la nota se incluye igual (la unidad no se cuenta
    //    porque fue filtrada arriba en unidadesEnvios).
    const penalPorFecha = {};
    const notasPorFecha = {};
    const debugNotas = [];
    rutas.forEach(r => {
      const f = (r.salida || "").substring(0, 10);
      if (!f || f < fechaDesde || f > fechaHasta) return;
      const info = getCostoInfo(r);
      const provFromRow = info.proveedor || r.carrier;
      if (!provFromRow || norm(provFromRow) !== provNorm) return;
      if (opsPermitidas && !opsPermitidas.has(normalizeOperacion(r.tipoRuta))) return;
      const { baseCost, costoNuevo } = getCostoReal(r);
      const desc = baseCost - costoNuevo;
      if (desc > 0) penalPorFecha[f] = (penalPorFecha[f] || 0) + desc;
      const notaTrim = (r.nota || "").trim();
      if (notaTrim) {
        if (!notasPorFecha[f]) notasPorFecha[f] = [];
        if (!notasPorFecha[f].includes(notaTrim)) notasPorFecha[f].push(notaTrim);
        debugNotas.push({ fecha: f, operador: r.operador, nota: notaTrim, baseCost, tipoRuta: r.tipoRuta, idRuta: r.id });
      }
    });
    if (typeof window !== "undefined") {
      console.log(`[Prefactura] Notas detectadas para ${proveedor} (${debugNotas.length}):`, debugNotas);
    }

    // 6) Renderizar HTML
    const fmtFecha = isoDate => {
      const [y, m, d] = isoDate.split("-");
      return `${parseInt(d)}-${parseInt(m)}-${y.substring(2)}`;
    };
    const fmtRangoTitulo = () => {
      const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
      const a = new Date(fechaDesde + "T12:00:00");
      const b = new Date(fechaHasta + "T12:00:00");
      return `DEL ${a.getDate()} DE ${meses[a.getMonth()].toUpperCase()} AL ${b.getDate()} DE ${meses[b.getMonth()].toUpperCase()}`;
    };

    let totalUnidades = 0;
    let subtotal = 0;
    const filasHtml = fechas.map(f => {
      const esDomingo = new Date(f + "T12:00:00").getDay() === 0;
      const cuentas = conteos[f];
      const sumaUnidades = tipos.reduce((s, t) => s + (cuentas[t] || 0), 0);
      const importeFila = tipos.reduce((s, t) => s + (cuentas[t] || 0) * (costoPorTipo[t] || 0), 0);
      totalUnidades += sumaUnidades;
      subtotal += importeFila;
      const desc = penalPorFecha[f] || 0;
      const notas = (notasPorFecha[f] || []).join(" · ");
      const baseComent = esDomingo && sumaUnidades === 0 ? "Domingo" : "";
      const comentarios = [baseComent, notas].filter(Boolean).join(" — ");
      const bg = esDomingo ? "#FEF3C7" : "#FFFFFF";
      const tdsTipos = tipos.map(t => `<td class="num" style="background:${bg}">${cuentas[t] || ""}</td>`).join("");
      return `<tr style="background:${bg}">
        <td class="fecha">${fmtFecha(f)}</td>
        ${tdsTipos}
        <td class="importe">${importeFila > 0 ? "$ " + importeFila.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "$ -"}</td>
        <td class="coment">${comentarios}</td>
        <td class="desc">${desc > 0 ? "-$ " + desc.toLocaleString("en-US", {minimumFractionDigits: 2}) : ""}</td>
      </tr>`;
    }).join("");

    const totalDescuento = Object.values(penalPorFecha).reduce((s, v) => s + v, 0);
    const subtotalNeto = subtotal - totalDescuento;
    const ivaMonto = conIVA ? subtotalNeto * 0.16 : 0;
    const totalFinal = subtotalNeto + ivaMonto;

    const totalesUnidadesPorTipo = tipos.map(t => {
      return fechas.reduce((s, f) => s + (conteos[f][t] || 0), 0);
    });

    // Logo del proveedor: busca en /public/logos/{slug}.{ext}. Si ninguna
    // extensión existe, el onerror final esconde la imagen y muestra el
    // nombre del proveedor como fallback.
    const logoSlug = String(proveedor || "")
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const origin = window.location.origin;
    const logoHtml = `
      <img class="provLogo" src="${origin}/logos/${logoSlug}.png" alt="${proveedor}"
        onerror="(function(img){var exts=['jpg','jpeg','svg','webp'],i=0;img.onerror=function(){if(i>=exts.length){img.style.display='none';var fb=img.parentNode.querySelector('.logoFallback');if(fb)fb.style.display='flex';return;}img.src='${origin}/logos/${logoSlug}.'+exts[i++];};})(this)" />
      <div class="logoFallback">${proveedor}</div>
    `;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Prefactura ${proveedor} ${fechaDesde} a ${fechaHasta}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI', Arial, sans-serif}
  body{padding:18mm 14mm;color:#1F2937;font-size:10pt}
  .header{display:flex;align-items:flex-start;gap:16px;margin-bottom:14px}
  .logoLeft{width:120px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding-top:6px}
  .logoLeft .t1{font-size:34pt;font-weight:900;color:#E63B2E;letter-spacing:-2px;line-height:1}
  .logoLeft .t1 span{color:#1F2937}
  .logoLeft .label{font-size:8pt;font-weight:700;color:#7C8495;margin-top:8px;letter-spacing:0.06em}
  .titleBlock{flex:1;text-align:center;padding-top:4px}
  .titleBlock .h1{font-size:24pt;font-weight:900;color:#000;letter-spacing:-0.5px}
  .titleBlock .h2{font-size:13pt;font-weight:800;color:#000;margin-top:4px}
  .logoRight{width:140px;flex-shrink:0;border:2px solid #1F4E8A;padding:6px;text-align:center;display:flex;align-items:center;justify-content:center;min-height:60px;position:relative}
  .logoRight .provLogo{max-width:100%;max-height:64px;object-fit:contain}
  .logoRight .logoFallback{display:none;align-items:center;justify-content:center;font-size:11pt;font-weight:800;color:#1F4E8A;width:100%;height:100%}
  .provBar{background:#1F2A40;color:#FFFFFF;font-size:18pt;font-weight:800;text-align:center;padding:8px;letter-spacing:0.04em;margin-bottom:0}
  .subTitle{text-align:center;font-size:13pt;font-weight:800;padding:8px 0;color:#000}
  table{width:100%;border-collapse:collapse;font-size:9.5pt}
  th{background:#FFFFFF;color:#1F2937;font-weight:700;border:1px solid #1F2937;padding:6px 8px;text-align:center;font-size:9pt}
  td{border:1px solid #1F2937;padding:5px 8px;text-align:center}
  td.fecha{font-weight:600}
  td.num{font-weight:700}
  td.importe{text-align:right;font-family:'Consolas','Courier New',monospace}
  td.coment{text-align:center;font-weight:700;color:#000}
  td.desc{text-align:right;font-family:'Consolas','Courier New',monospace}
  .totalRow td{background:#FFFFFF;font-weight:800}
  .totalLabel{color:#E63B2E;font-size:14pt;font-weight:800}
  .totalNum{color:#E63B2E;font-size:14pt;font-weight:800}
  .summary{margin-top:0;display:flex;justify-content:flex-end}
  .summary table{width:60%}
  .summary td{padding:5px 10px}
  .summary .lbl{font-weight:700;text-align:left;background:#FFFFFF}
  .summary .val{text-align:right;font-family:'Consolas','Courier New',monospace}
  .footer{margin-top:24px;padding-top:8px;text-align:center}
  .footer .easy{background:#FFF8C5;padding:8px;font-size:13pt;font-weight:800;color:#000;margin-bottom:6px}
  .footer .contact{font-size:11pt;color:#1F4E8A;font-weight:600;margin-bottom:14px}
  .footer .brand{font-size:18pt;font-weight:800;color:#000;border-top:1px solid #000;border-bottom:1px solid #000;padding:6px 0;margin-bottom:14px}
  .fiscal{display:grid;grid-template-columns:1fr 2fr 2fr;font-size:8.5pt;border:1px solid #1F2937}
  .fiscal > div{padding:6px;border-right:1px solid #1F2937}
  .fiscal > div:last-child{border-right:none}
  .fiscal .h{background:#FFFFFF;font-weight:800;text-align:center;border-bottom:1px solid #1F2937}
  .nota{font-size:8pt;color:#7C8495;text-align:center;margin-top:10px;line-height:1.4}
  @media print { body{padding:14mm 10mm} .pageBreak{page-break-after:always} }
</style></head><body>
  <div class="header">
    <div class="logoLeft">
      <div class="t1">T<span>1</span></div>
      <div class="label">PROVEEDOR</div>
    </div>
    <div class="titleBlock">
      <div class="h1">SOLICITUD DE FACTURA</div>
      <div class="h2">SOLICITUD DE FACTURA ${fmtRangoTitulo()}</div>
    </div>
    <div class="logoRight">${logoHtml}</div>
  </div>
  <div class="provBar">${proveedor}</div>
  <div class="subTitle">ASISTENCIA DE OPERADORES ¨${operacionesFiltro && operacionesFiltro.length > 0 ? operacionesFiltro.join(" + ").toUpperCase() : "LM"}¨</div>
  <table>
    <thead>
      <tr>
        <th style="width:90px">FECHA</th>
        ${tipos.map(t => `<th style="width:120px">${t.toUpperCase()} ($${(costoPorTipo[t]||0).toLocaleString()})</th>`).join("")}
        <th style="width:130px">Importe</th>
        <th>Comentarios</th>
        <th style="width:130px">Descuento</th>
      </tr>
    </thead>
    <tbody>
      ${filasHtml}
      <tr class="totalRow">
        <td class="totalLabel">TOTAL</td>
        ${totalesUnidadesPorTipo.map(n => `<td class="totalNum">${n}</td>`).join("")}
        <td class="importe" style="font-weight:800">$ ${subtotal.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td></td>
        <td class="desc" style="font-weight:800">${totalDescuento > 0 ? "-$ " + totalDescuento.toLocaleString("en-US", {minimumFractionDigits: 2}) : ""}</td>
      </tr>
    </tbody>
  </table>
  <div class="summary">
    <table>
      <tr><td class="val">$ ${subtotal.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td><td class="lbl">SUBTOTAL</td></tr>
      <tr><td class="val">${totalDescuento > 0 ? "-$ " + totalDescuento.toLocaleString("en-US", {minimumFractionDigits: 2}) : "$ -"}</td><td class="lbl">DESCUENTO</td></tr>
      <tr><td class="val">$ ${subtotalNeto.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td><td class="lbl">SUBTOTAL</td></tr>
      ${conIVA ? `<tr><td class="val">$ ${ivaMonto.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td><td class="lbl">IVA</td></tr>` : ""}
      <tr><td class="val" style="font-weight:800">$ ${totalFinal.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td><td class="lbl">TOTAL</td></tr>
    </table>
  </div>
  <div class="footer">
    <div class="easy">¡Enviar nunca fue tan fácil!</div>
    <div class="contact">Eduardo Neri Gonzalez / eduardo.gonzalez@t1.com / Cel 5535668113</div>
    <div class="brand">T1.com</div>
    <div class="fiscal">
      <div class="h">RFC</div>
      <div class="h">REGIMEN FISCAL</div>
      <div class="h">Metodo de Pago - PPD</div>
      <div></div>
      <div></div>
      <div>Forma de pago - 99 por definir</div>
    </div>
    <div class="nota">Generado automáticamente desde T1 Ops Flotilla · ${new Date().toLocaleString("es-MX")}</div>
  </div>
  <script>setTimeout(() => window.print(), 400);</script>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) { alert("Permite las ventanas emergentes para descargar la prefactura."); return; }
    w.document.write(html);
    w.document.close();
  };

  const getRisk = (r) => {
    if (r.pctEntrega < 50) return "high";
    if (r.pctEntrega < 80 || r.noVisitados > r.total * 0.3) return "medium";
    return null;
  };

  // Combina rutas reales del Excel + asistencias del Registro Diario que no
  // tienen ruta cargada (para que se vean también en la tabla y se puedan
  // editar/eliminar). Las sintéticas se marcan con _esAsistencia=true.
  const rutasCombinadas = (() => {
    if (!asistencia.length) return rutas;
    // Set de (operador|fecha) que YA tiene ruta real cargada
    const conRuta = new Set();
    rutas.forEach(r => {
      if (!r.operador) return;
      const f = (r.salida || "").substring(0, 10);
      if (f) conRuta.add(`${norm(r.operador)}|${f}`);
    });
    // Asistencias del periodo, sin ruta correspondiente, con operador real
    const candidatas = asistencia.filter(a => {
      const f = (a.fecha || "").substring(0, 10);
      if (f < fechaDesde || f > fechaHasta) return false;
      if (!a.nombre_operador || a.nombre_operador === "Registro manual") return false;
      return !conRuta.has(`${norm(a.nombre_operador)}|${f}`);
    });
    // Dedup por (operador|fecha|tipo_unidad|operación canónica) — misma unidad
    // registrada bajo varios labels el mismo día cuenta una vez.
    const dedupedSinRuta = dedupAsistencia(candidatas);
    const sinteticas = dedupedSinRuta.map(a => {
      const car = carriers.find(c => norm(c.proveedor) === norm(a.proveedor) && c.tipo_unidad === a.tipo_unidad);
      const baseCost = car ? (parseFloat(car.costo_unidad) || 0) : 0;
      return {
        id: null,
        _esAsistencia: true,
        asistenciaId: a.id,
        idRuta: `ASI-${a.id}`,
        carrier: a.proveedor,
        operador: a.nombre_operador,
        correo: a.correo || "",
        placa: a.placa || "",
        almacen: "T1 ENVIOS",
        economico: "",
        status: "Sólo asistencia",
        total: 0, entregados: 0, recolecciones: 0,
        pctEntrega: 0, intentados: 0, noVisitados: 0,
        salida: a.fecha + (a.timestamp ? "T" + String(a.timestamp).substring(11, 19) : "T08:00:00"),
        intercambios: 0,
        tipoRuta: a.tipo_operacion || "Última milla",
        kmEstimados: "—", kmRecorridos: "—", tiempoEstimado: "—", tiempoReal: "—",
        penalizacion: "", nota: "",
        _baseCostSintetico: baseCost,
        _tipoUnidadSintetico: a.tipo_unidad,
      };
    });
    return [...rutas, ...sinteticas];
  })();

  const filtered = rutasCombinadas.filter(r => {
    if (filter === "En ruta" && r.status !== "En curso") return false;
    if (filter === "En riesgo" && !(getRisk(r) === "high" || getRisk(r) === "medium")) return false;
    if (filter === "Completadas" && r.status !== "Completada") return false;
    if (filterProveedor !== "Todos") {
      const provNorm = norm(filterProveedor);
      const carrierMatch = norm(r.carrier) === provNorm;
      const info = carrierMatch ? null : (r._esAsistencia ? null : getCostoInfo(r));
      const inferidoMatch = info && info.proveedor && norm(info.proveedor) === provNorm;
      if (!carrierMatch && !inferidoMatch) return false;
    }
    if (filterOperador !== "Todos" && norm(r.operador) !== norm(filterOperador)) return false;
    if (filterOperacion !== "Todas" && normalizeOperacion(r.tipoRuta) !== filterOperacion) return false;
    return true;
  }).slice().sort((a, b) => (a.operador || "").localeCompare(b.operador || "", "es", { sensitivity: "base" }));

  // Listas para los dropdowns de filtro (de las rutas actuales)
  const proveedoresFiltro = (() => {
    const set = new Set();
    rutas.forEach(r => { if (r.carrier && r.carrier !== "—") set.add(r.carrier); });
    // Dedup case-insensitive: conservar la variante con más apariciones
    const counts = new Map();
    rutas.forEach(r => {
      if (!r.carrier || r.carrier === "—") return;
      const k = norm(r.carrier);
      if (!counts.has(k)) counts.set(k, new Map());
      counts.get(k).set(r.carrier, (counts.get(k).get(r.carrier) || 0) + 1);
    });
    const finales = [];
    counts.forEach(variants => {
      let best = null, bestCount = -1;
      variants.forEach((c, n) => { if (c > bestCount) { best = n; bestCount = c; } });
      if (best) finales.push(best);
    });
    return finales.sort();
  })();

  const operadoresFiltro = (() => {
    const provNorm = filterProveedor !== "Todos" ? norm(filterProveedor) : null;
    const set = new Set();
    rutas.forEach(r => {
      if (!r.operador || r.operador === "Sin nombre") return;
      if (provNorm && norm(r.carrier) !== provNorm) return;
      set.add(r.operador);
    });
    return [...set].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  })();

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

  // Tipos de ruta donde un operador repetido en el mismo día cobra solo una vez
  // (el costo unitario se comparte y los paquetes se suman). No aplica a tipos
  // de tarifa fija porque ya cobran por paquete (dedup es equivalente).
  const DEDUP_TIPOS = new Set(["PETCO", "Foráneo Puebla"]);
  const esDedup = r => DEDUP_TIPOS.has(r.tipoRuta);

  // Agrupar rutas dedup por (fecha, operador, tipoRuta) para compartir costo
  const dedupGroups = {};
  rutas.forEach((r, i) => {
    if (!esDedup(r)) return;
    const fecha = (r.salida || "").substring(0, 10);
    if (!fecha || !r.operador) return;
    const key = fecha + "|" + norm(r.operador) + "|" + r.tipoRuta;
    if (!dedupGroups[key]) dedupGroups[key] = [];
    dedupGroups[key].push(i);
  });
  const getDedupInfo = (r, ridx) => {
    if (!esDedup(r)) return null;
    const fecha = (r.salida || "").substring(0, 10);
    const key = fecha + "|" + norm(r.operador) + "|" + r.tipoRuta;
    const group = dedupGroups[key] || [];
    if (group.length <= 1) return null;
    const isPrimary = group[0] === ridx;
    const sumPaq = group.reduce((s, i) => {
      const ri = rutas[i];
      return s + (parseInt(ri.entregados) || 0) + (isCrossdock(ri) ? (parseInt(ri.recolecciones) || 0) : 0);
    }, 0);
    return { isPrimary, sumPaq, groupSize: group.length };
  };

  // NEW: Real cost calculations from rutas × asistencia × carriers
  const rutaCosto = rutas.map((r, idx) => {
    const info = getCostoInfo(r);
    const hasFormula = (r.penalizacion || "").trim().length > 0;
    const evaluated = evalFormula(r.penalizacion, info.baseCost);
    const costoNuevo = hasFormula && !isNaN(evaluated) ? evaluated : info.baseCost;
    const descuento = info.baseCost - costoNuevo;
    const dedup = getDedupInfo(r, idx);
    // For dedup groups: packages divisor = group sum; cost only counted on primary row
    const divisor = dedup ? dedup.sumPaq : (isCrossdock(r) ? r.recolecciones : r.entregados);
    const costoContado = dedup ? (dedup.isPrimary ? costoNuevo : 0) : costoNuevo;
    const costoPorPaq = dedup
      ? (dedup.sumPaq > 0 ? costoNuevo / dedup.sumPaq : null)
      : (divisor > 0 ? costoNuevo / divisor : null);
    return { r, info, baseCost: info.baseCost, descuento, costoNuevo, divisor, costoPorPaq, dedup, costoContado };
  });
  const costoTotalDiaNuevo = rutaCosto.reduce((s, x) => s + x.costoContado, 0);
  // Paquetes entregados para el costo/paquete: TODAS las operaciones EXCEPTO
  // los entregados de Crossdock/HalfMile (esos son media milla y no suman al
  // KPI de paquetes entregados al cliente final).
  const entregadosTotal = rutas.reduce((s, r) => s + (isCrossdock(r) ? 0 : (r.entregados || 0)), 0);
  const costoPorPaqGlobal = entregadosTotal > 0 ? (costoTotalDiaNuevo / entregadosTotal) : 0;
  const sinAsistencia = rutaCosto.filter(x => x.info.missing && !esPermisible(x.r)).length;
  const sinAsistenciaPermisible = rutaCosto.filter(x => x.info.missing && esPermisible(x.r)).length;
  const crossSinRecol = rutaCosto.filter(x => isCrossdock(x.r) && (!x.r.recolecciones || x.r.recolecciones === 0)).length;

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
          <button onClick={() => {
            const p = proveedoresEnPeriodo[0] || "";
            setPrefactProveedor(p);
            // Default: marca sólo las operaciones canónicas que tengan registros
            setPrefactOperaciones(OPERACIONES_CANONICAS.filter(op => conteoOperacion(p, op) > 0));
            setPrefactOpen(true);
          }} style={{
            padding: "10px 18px", borderRadius: 8, border: "1px solid " + C.green, backgroundColor: C.greenBg,
            color: C.green, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            <IC.Download /> Descargar prefactura
          </button>
          <button onClick={() => { setManualForm(blankManual()); setManualMsg(""); setManualOpen(true); }} style={{
            padding: "10px 18px", borderRadius: 8, border: "1px solid " + C.accent, backgroundColor: C.accentLight,
            color: C.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            <IC.Plus /> Captura manual
          </button>
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

      {/* Costo real calculado (rutas × asistencia × carriers) */}
      {rutas.length > 0 && (
        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          <StatCard label="Costo total del día" value={"$" + costoTotalDiaNuevo.toLocaleString(undefined, {maximumFractionDigits:0})} subvalue={"suma de todas las rutas"} icon={<IC.Dollar />} color={C.accent} />
          <StatCard label="Costo / paquete entregado" value={entregadosTotal>0 ? "$" + costoPorPaqGlobal.toFixed(2) : "—"} subvalue={entregadosTotal + " paquetes (excluye crossdock)"} icon={<IC.Package />} color={C.green} />
          <StatCard label="Rutas sin asistencia" value={sinAsistencia.toString()} subvalue={sinAsistenciaPermisible>0 ? "+"+sinAsistenciaPermisible+" permisibles (foráneo/PETCO)" : sinAsistencia>0 ? "operador no registrado" : "todos registrados"} icon={<IC.Users />} color={sinAsistencia>0?C.red:C.textMuted} />
          <StatCard label="Crossdock sin recolecciones" value={crossSinRecol.toString()} subvalue={crossSinRecol>0 ? "corregir manualmente" : "OK"} icon={<IC.Map />} color={crossSinRecol>0?C.yellow:C.textMuted} />
        </div>
      )}

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Día:</span>
          {/* Flecha día anterior */}
          <button onClick={() => shiftDay(-1)} title="Día anterior"
            style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid " + C.border, backgroundColor: C.white, color: C.text, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ‹
          </button>
          {/* Input fecha (un solo toque por default) */}
          <input type="date" value={fechaDesde}
            onChange={e => {
              setFechaDesde(e.target.value);
              if (!modoRango) setFechaHasta(e.target.value);
              else if (e.target.value > fechaHasta) setFechaHasta(e.target.value);
            }}
            style={{ padding: "6px 9px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600 }} />
          {modoRango && (
            <>
              <span style={{ fontSize: 12, color: C.textMuted }}>al</span>
              <input type="date" value={fechaHasta}
                onChange={e => { if (e.target.value >= fechaDesde) setFechaHasta(e.target.value); }}
                style={{ padding: "6px 9px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600 }} />
            </>
          )}
          {/* Flecha día siguiente */}
          <button onClick={() => shiftDay(1)} title="Día siguiente"
            style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid " + C.border, backgroundColor: C.white, color: C.text, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ›
          </button>
          {/* Botón Ayer */}
          <button onClick={() => { setFechaDesde(ayerStr); setFechaHasta(ayerStr); setModoRango(false); }}
            title="Ayer (día vencido)"
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + C.border, backgroundColor: C.white, color: C.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            Ayer
          </button>
          {/* Toggle modo rango */}
          <button onClick={() => { setModoRango(!modoRango); if (modoRango) setFechaHasta(fechaDesde); }}
            title={modoRango ? "Volver a un solo día" : "Filtrar rango de días"}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + (modoRango ? C.accent : C.border), backgroundColor: modoRango ? C.accentLight : C.white, color: modoRango ? C.accent : C.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            {modoRango ? "Un día" : "Rango"}
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, marginLeft: 4 }}>
            {fechaDesde === fechaHasta
              ? new Date(fechaDesde + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
              : new Date(fechaDesde + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" }) + " — " + new Date(fechaHasta + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
            }
            <span style={{ marginLeft: 6, fontSize: 12, color: C.textMuted, fontWeight: 500 }}>({filtered.length} rutas)</span>
          </span>
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

      {/* Filtros adicionales: Proveedor / Operador / Tipo de operación */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14, padding: "10px 14px", backgroundColor: C.white, borderRadius: 10, border: "1px solid " + C.border }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Filtros:</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>Proveedor</label>
          <select value={filterProveedor} onChange={e => { setFilterProveedor(e.target.value); setFilterOperador("Todos"); }}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + (filterProveedor !== "Todos" ? C.accent : C.border), fontSize: 12, fontWeight: 600, backgroundColor: filterProveedor !== "Todos" ? C.accentLight : C.white, color: filterProveedor !== "Todos" ? C.accent : C.text, cursor: "pointer" }}>
            <option value="Todos">Todos</option>
            {proveedoresFiltro.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>Operador</label>
          <select value={filterOperador} onChange={e => setFilterOperador(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + (filterOperador !== "Todos" ? C.accent : C.border), fontSize: 12, fontWeight: 600, backgroundColor: filterOperador !== "Todos" ? C.accentLight : C.white, color: filterOperador !== "Todos" ? C.accent : C.text, cursor: "pointer", maxWidth: 240 }}>
            <option value="Todos">Todos ({operadoresFiltro.length})</option>
            {operadoresFiltro.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>Tipo operación</label>
          <select value={filterOperacion} onChange={e => setFilterOperacion(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid " + (filterOperacion !== "Todas" ? C.accent : C.border), fontSize: 12, fontWeight: 600, backgroundColor: filterOperacion !== "Todas" ? C.accentLight : C.white, color: filterOperacion !== "Todas" ? C.accent : C.text, cursor: "pointer" }}>
            <option value="Todas">Todas</option>
            {OPERACIONES_CANONICAS.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>
        {(filterProveedor !== "Todos" || filterOperador !== "Todos" || filterOperacion !== "Todas") && (
          <button onClick={() => { setFilterProveedor("Todos"); setFilterOperador("Todos"); setFilterOperacion("Todas"); }}
            style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid " + C.red, backgroundColor: C.redBg, color: C.red, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            ✕ Limpiar
          </button>
        )}
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: C.textMuted }}>{filtered.length} resultado{filtered.length === 1 ? "" : "s"}</span>
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
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1400 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              <th style={{ width: 30, padding: "10px 6px" }}>
                <input type="checkbox" checked={selectedRows.size === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ cursor: "pointer", accentColor: C.accent }} />
              </th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", minWidth: 140, whiteSpace: "nowrap" }}>Empleado</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", minWidth: 180, whiteSpace: "nowrap" }}>Estatus</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", minWidth: 130, whiteSpace: "nowrap" }}>Transportista</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", whiteSpace: "nowrap" }}>Tipo ruta</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", whiteSpace: "nowrap" }}>Costo unidad</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", whiteSpace: "nowrap" }}>Penalties</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", whiteSpace: "nowrap" }}>Costo real</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", whiteSpace: "nowrap" }}>$/Paq</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", whiteSpace: "nowrap" }}>Inter.</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", whiteSpace: "nowrap", minWidth: 140 }}>Fecha despacho</th>
              <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", whiteSpace: "nowrap", minWidth: 160 }}>Nota</th>
              <th style={{ width: 40, padding: "10px 6px", textAlign: "center", fontSize: 10, fontWeight: 700, color: C.textMuted, whiteSpace: "nowrap" }}>⋯</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const rutaIdx = rutas.indexOf(r);
              const dedupRow = getDedupInfo(r, rutaIdx);
              const bgGrupo = dedupRow ? "#F5F3FF" : "transparent";
              // CRÍTICO: key debe ser estable por ruta (r.id). Con key={i} React
              // reutilizaba el mismo DOM <tr> para rutas distintas cuando cambia
              // el filtro/orden, y los inputs no controlados (penalización,
              // nota, recolecciones) retenían el texto tecleado pero con un
              // handler onBlur que ya apuntaba a OTRO operador — guardando la
              // edición al operador equivocado.
              return (
              <tr key={r.id ?? "idx-" + i} style={{ borderBottom: `1px solid ${C.border}`, position: "relative", backgroundColor: bgGrupo }}
                onMouseEnter={ev => { if (!dedupRow) ev.currentTarget.style.backgroundColor = "#FAFBFF"; }}
                onMouseLeave={ev => { ev.currentTarget.style.backgroundColor = bgGrupo; }}>
                {/* Color bar */}
                <td style={{ padding: 0, position: "relative", width: 4 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: dedupRow ? 5 : 4, backgroundColor: dedupRow ? "#7C3AED" : getBarColor(r) }} />
                  <div style={{ paddingLeft: 12 }}>
                    <input type="checkbox" checked={selectedRows.has(i)} onChange={() => toggleRow(i)} style={{ cursor: "pointer", accentColor: C.accent }} />
                  </div>
                </td>
                {/* Empleado + risk */}
                <td style={{ padding: "14px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.operador}</span>
                    {r._esAsistencia && (
                      <span title="Sólo asistencia: este operador tiene check-in en Registro Diario pero no tiene ruta cargada del Excel."
                        style={{ fontSize: 9, fontWeight: 800, color: "#0284C7", padding: "2px 6px", borderRadius: 10, backgroundColor: "#DBEAFE", letterSpacing: "0.05em" }}>
                        ASISTENCIA
                      </span>
                    )}
                    {!r._esAsistencia && (String(r.idRuta || "").startsWith("MAN-") ? (
                      <span title="Ruta capturada manualmente desde el botón Captura manual."
                        style={{ fontSize: 9, fontWeight: 800, color: "#16A34A", padding: "2px 6px", borderRadius: 10, backgroundColor: "#DCFCE7", letterSpacing: "0.05em" }}>
                        MANUAL
                      </span>
                    ) : (
                      <span title="Ruta importada automáticamente desde la carga masiva de Excel."
                        style={{ fontSize: 9, fontWeight: 800, color: "#7C8495", padding: "2px 6px", borderRadius: 10, backgroundColor: "#F1F5F9", letterSpacing: "0.05em" }}>
                        EXCEL
                      </span>
                    ))}
                    {dedupRow && (
                      <span title={"Forma parte de un grupo de " + dedupRow.groupSize + " rutas del mismo operador hoy"}
                        style={{ fontSize: 9, fontWeight: 800, color: "#7C3AED", padding: "2px 6px", borderRadius: 10, backgroundColor: "#EDE9FE", letterSpacing: "0.05em" }}>
                        GRUPO {dedupRow.groupSize}
                      </span>
                    )}
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
                <td style={{ padding: "10px 8px" }}>
                  {(() => {
                    const isPerm = TIPOS_PERMISIBLES.has(r.tipoRuta);
                    return (
                      <select value={r.tipoRuta} onChange={e => updateRuta(rutas.indexOf(r), "tipoRuta", e.target.value)}
                        title={isPerm ? "Permisible: puede no tener registro automático de operador" : ""}
                        style={{
                          fontSize: 12, padding: "4px 8px", borderRadius: 6,
                          border: "1px solid " + (isPerm ? "#7C3AED" : C.border),
                          backgroundColor: isPerm ? "#EDE9FE" : C.white,
                          color: isPerm ? "#7C3AED" : C.text,
                          cursor: "pointer", fontWeight: isPerm ? 700 : 500,
                        }}>
                        <option value="Última milla">Última milla</option>
                        <option value="HalfMile">HalfMile</option>
                        <option value="PETCO">PETCO</option>
                        <option value="PETCO Monterrey">PETCO Monterrey</option>
                        <option value="Foráneo Puebla">Foráneo Puebla</option>
                        <option value="Foráneo Monterrey">Foráneo MTY</option>
                        <option value="Foráneo GDL">Foráneo GDL</option>
                      </select>
                    );
                  })()}
                </td>
                {/* Costo unidad (desde asistencia × carriers) */}
                {(() => {
                  const info = getCostoInfo(r);
                  const hasFormula = (r.penalizacion || "").trim().length > 0;
                  const evaluated = evalFormula(r.penalizacion, info.baseCost);
                  const costoNuevo = hasFormula && !isNaN(evaluated) ? evaluated : info.baseCost;
                  const descuento = info.baseCost - costoNuevo;
                  const cross = isCrossdock(r);
                  const dedup = getDedupInfo(r, rutas.indexOf(r));
                  const divisor = dedup ? dedup.sumPaq : (cross ? r.recolecciones : r.entregados);
                  const cpp = divisor > 0 ? costoNuevo / divisor : null;
                  const crossSinRec = cross && (!r.recolecciones || r.recolecciones === 0);
                  const penInvalid = hasFormula && isNaN(evaluated);
                  return <>
                    <td style={{ padding: "10px 8px", whiteSpace: "nowrap" }}>
                      {info.flatRate ? (
                        <div title={"Tarifa fija " + r.tipoRuta + ": $" + info.flatRateValue + " × " + info.paqOperados + " paquetes operados"} style={{ fontSize: 12, fontWeight: 700, color: "#0284C7", lineHeight: 1.2 }}>
                          ${info.baseCost.toLocaleString()}
                          <div style={{ fontSize: 9, color: "#0284C7", fontWeight: 600 }}>${info.flatRateValue}/paq × {info.paqOperados}</div>
                        </div>
                      ) : info.missing ? (
                        esPermisible(r) ? (
                          <div title={"Sin registro de operador (permisible: " + r.tipoRuta + ")"} style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, lineHeight: 1.2 }}>
                            <span style={{ color: "#7C3AED" }}>●</span> Permisible
                            <div style={{ fontSize: 9, color: "#7C3AED", fontWeight: 600 }}>{r.tipoRuta}</div>
                          </div>
                        ) : (
                          <div title="Operador no encontrado en Registro Diario (solo check-in automático). Si es foráneo, PETCO o HalfMile, cambia el Tipo ruta." style={{ fontSize: 12, color: C.red, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                            <span>⚠</span><span>$0</span>
                          </div>
                        )
                      ) : (
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.green, lineHeight: 1.2 }}>
                          ${info.baseCost.toLocaleString()}
                          <div style={{ fontSize: 9, color: info.fallback ? "#7C3AED" : C.textMuted, fontWeight: info.fallback ? 600 : 500 }}>
                            {info.tipo_unidad}
                            {info.fallback === "operador" && <span title="Costo inferido del último check-in del operador"> · ref.</span>}
                            {info.fallback === "carrier" && <span title="Operador sin historial. Costo estimado del carrier/transportista"> · est.</span>}
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "8px 6px" }}>
                      <input key={"pen-" + (r.id ?? i)} type="text" defaultValue={r.penalizacion || ""}
                        onBlur={e => { if (e.target.value !== (r.penalizacion || "")) savePenalizacion(r.id, e.target.value); }}
                        placeholder="costo*0.86"
                        title={"Fórmula que evalúa al COSTO REAL FINAL (no al descuento).\nVariable 'costo' = costo base.\nEj: costo*0.86 (paga 86%) · costo-250 (resta $250) · 1161 (costo fijo)"}
                        style={{ width: 80, padding: "4px 6px", borderRadius: 5, border: "1px solid " + (penInvalid ? C.red : C.border), fontSize: 11, fontFamily: "monospace", backgroundColor: penInvalid ? C.redBg : C.white }} />
                    </td>
                    <td style={{ padding: "10px 8px", whiteSpace: "nowrap" }}>
                      {info.missing ? (
                        <span style={{ fontSize: 12, color: C.textMuted }}>—</span>
                      ) : dedup && !dedup.isPrimary ? (
                        <div title={"Costo compartido con la primera ruta del operador (×" + dedup.groupSize + " hoy)"} style={{ fontSize: 11, color: C.textMuted, fontStyle: "italic", lineHeight: 1.2 }}>
                          Compartido
                          <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 500 }}>×{dedup.groupSize} hoy</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, fontWeight: 800, color: descuento > 0 ? C.accent : C.text, lineHeight: 1.2 }}>
                          ${costoNuevo.toLocaleString()}
                          {descuento !== 0 && <div style={{ fontSize: 9, fontWeight: 600, color: descuento > 0 ? C.red : C.green }}>{descuento > 0 ? "−" : "+"}${Math.abs(descuento).toLocaleString()}</div>}
                          {dedup && dedup.isPrimary && <div style={{ fontSize: 9, fontWeight: 600, color: "#7C3AED" }}>×{dedup.groupSize} rutas</div>}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "10px 8px", whiteSpace: "nowrap" }}>
                      {crossSinRec ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <span title="Crossdock sin recolecciones" style={{ color: C.yellow, fontSize: 13 }}>⚠</span>
                          <input key={"rec-" + (r.id ?? i)} type="number" min="0" defaultValue={r.recolecciones || 0}
                            onBlur={e => { const v = parseInt(e.target.value) || 0; if (v !== (r.recolecciones || 0)) saveRecolecciones(r.id, v); }}
                            placeholder="#"
                            title="Recolecciones (crossdock) — ingrese manualmente"
                            style={{ width: 50, padding: "3px 5px", borderRadius: 5, border: "1px solid " + C.yellow, fontSize: 11, textAlign: "center" }} />
                        </div>
                      ) : cpp !== null ? (
                        <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, lineHeight: 1.2 }}>
                          ${cpp.toFixed(2)}
                          <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 500 }}>
                            {dedup ? "/Σ " + dedup.sumPaq + " paq" : "/" + (cross ? "recol" : "entr")}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: C.textMuted }}>—</span>
                      )}
                    </td>
                  </>;
                })()}
                {/* Intercambios */}
                <td style={{ padding: "14px 12px", fontSize: 13, fontWeight: 600, color: r.intercambios > 0 ? C.blue : C.textMuted }}>
                  {r.intercambios > 0 ? `+ ${r.intercambios}` : "—"}
                </td>
                {/* Fechas */}
                <td style={{ padding: "12px 8px", fontSize: 11, color: C.textMuted, whiteSpace: "nowrap" }}>
                  {r.salida ? (() => {
                    const [fecha, hora] = r.salida.substring(0, 16).split(" ");
                    return <div style={{ lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 600, color: C.text }}>{fecha}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{hora || ""}</div>
                    </div>;
                  })() : "—"}
                </td>
                {/* Nota — se imprime en la prefactura (columna Comentarios) */}
                <td style={{ padding: "8px 6px" }}>
                  <input key={"nota-" + (r.id ?? i)} type="text" defaultValue={r.nota || ""}
                    onBlur={e => { if (e.target.value !== (r.nota || "")) saveNota(r.id, e.target.value); }}
                    placeholder="Nota para prefactura..."
                    title="Esta nota se imprime en la columna Comentarios de la prefactura para el día correspondiente."
                    style={{ width: "100%", minWidth: 140, padding: "5px 8px", borderRadius: 5, border: "1px solid " + (r.nota ? C.accent : C.border), fontSize: 11, backgroundColor: r.nota ? C.accentLight : C.white, color: r.nota ? C.accent : C.text, fontWeight: r.nota ? 600 : 400 }} />
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
                      <button onClick={() => deleteRuta(r)} style={{
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
              );
            })}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textMuted }}>No hay rutas para mostrar</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Usa "Carga masiva" para importar tu archivo Excel de rutas</div>
          </div>
        )}
      </div>

      {/* Manual route capture modal */}
      {manualOpen && (() => {
        const carriersUM = (() => {
          const seen = new Set();
          carriers.forEach(c => { if (c.proveedor) seen.add(c.proveedor); });
          asistencia.forEach(a => { if (a.proveedor) seen.add(a.proveedor); });
          return [...seen].sort();
        })();
        const operadoresLista = manualForm.carrier
          ? Array.from(getOperadoresFor(manualForm.carrier).values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
          : [];
        const tiposLista = manualForm.carrier
          ? [...new Set(carriers.filter(c => c.proveedor === manualForm.carrier && c.tipo_unidad && c.tipo_unidad !== "—").map(c => c.tipo_unidad))]
          : [];
        const totalCalc = (parseInt(manualForm.entregados) || 0) + (parseInt(manualForm.intentados) || 0) + (parseInt(manualForm.noVisitados) || 0);
        const isHalfMile = (manualForm.tipoRuta || "").toLowerCase().includes("half") || (manualForm.tipoRuta || "").toLowerCase().includes("cross");
        const tiposRuta = ["Última milla", "HalfMile", "PETCO", "PETCO Monterrey", "Foráneo Puebla", "Foráneo Monterrey", "Foráneo GDL"];
        return (
          <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(12,20,37,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000, padding:16 }}
            onClick={() => !manualSaving && setManualOpen(false)}>
            <div onClick={e => e.stopPropagation()} style={{ backgroundColor:C.white, borderRadius:14, width:780, maxWidth:"96vw", maxHeight:"92vh", overflow:"auto", boxShadow:"0 16px 56px rgba(0,0,0,0.28)" }}>
              <div style={{ padding:"18px 24px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:18, fontWeight:800, color:C.text }}>Captura manual de ruta</div>
                  <div style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>Registra una ruta sin necesidad de cargar el Excel completo</div>
                </div>
                <button onClick={() => !manualSaving && setManualOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:C.textMuted, padding:4 }}>×</button>
              </div>
              <div style={{ padding:24, display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:16 }}>
                {/* Fecha */}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMuted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Fecha de despacho *</label>
                  <input type="date" value={manualForm.fecha}
                    onChange={e => setManualForm(f => ({ ...f, fecha: e.target.value }))}
                    style={{ width:"100%", padding:"9px 11px", borderRadius:7, border:"1px solid "+C.border, fontSize:13, fontWeight:600, boxSizing:"border-box" }} />
                </div>
                {/* Tipo de ruta */}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMuted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Tipo de ruta *</label>
                  <select value={manualForm.tipoRuta}
                    onChange={e => setManualForm(f => ({ ...f, tipoRuta: e.target.value }))}
                    style={{ width:"100%", padding:"9px 11px", borderRadius:7, border:"1px solid "+C.border, fontSize:13, fontWeight:600, boxSizing:"border-box", backgroundColor:C.white }}>
                    {tiposRuta.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {/* Transportista */}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMuted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Transportista *</label>
                  <select value={manualForm.carrier}
                    onChange={e => {
                      const carrier = e.target.value;
                      setManualForm(f => ({ ...f, carrier, operador:"", tipoUnidad:"", costoUnidad:"", placa:"", correo:"" }));
                    }}
                    style={{ width:"100%", padding:"9px 11px", borderRadius:7, border:"1px solid "+(manualForm.carrier?C.accent:C.border), fontSize:13, fontWeight:600, boxSizing:"border-box", backgroundColor:C.white }}>
                    <option value="">— Selecciona transportista —</option>
                    {carriersUM.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {/* Operador */}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMuted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                    Operador * <span style={{ fontWeight:500, color:C.textMuted, textTransform:"none" }}>({operadoresLista.length} registrados)</span>
                  </label>
                  <select value={manualForm.operador} disabled={!manualForm.carrier}
                    onChange={e => {
                      const sel = operadoresLista.find(o => o.nombre === e.target.value);
                      const tipoUnidad = sel?.tipo_unidad || manualForm.tipoUnidad || (tiposLista[0] || "");
                      const costo = defaultCostoFor(manualForm.carrier, tipoUnidad);
                      setManualForm(f => ({
                        ...f,
                        operador: e.target.value,
                        tipoUnidad,
                        costoUnidad: costo ? String(costo) : f.costoUnidad,
                        placa: sel?.placa || f.placa,
                        correo: sel?.correo || f.correo,
                      }));
                    }}
                    style={{ width:"100%", padding:"9px 11px", borderRadius:7, border:"1px solid "+(manualForm.operador?C.accent:C.border), fontSize:13, fontWeight:600, boxSizing:"border-box", backgroundColor:manualForm.carrier?C.white:C.bg, cursor:manualForm.carrier?"pointer":"not-allowed" }}>
                    <option value="">{manualForm.carrier ? "— Selecciona operador —" : "Primero elige transportista"}</option>
                    {operadoresLista.map(o => <option key={o.nombre} value={o.nombre}>{o.nombre}{o.tipo_unidad ? ` · ${o.tipo_unidad}` : ""}</option>)}
                  </select>
                </div>
                {/* Tipo de unidad */}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMuted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Tipo de unidad</label>
                  <select value={manualForm.tipoUnidad} disabled={!manualForm.carrier}
                    onChange={e => {
                      const t = e.target.value;
                      const costo = defaultCostoFor(manualForm.carrier, t);
                      setManualForm(f => ({ ...f, tipoUnidad: t, costoUnidad: costo ? String(costo) : f.costoUnidad }));
                    }}
                    style={{ width:"100%", padding:"9px 11px", borderRadius:7, border:"1px solid "+C.border, fontSize:13, fontWeight:600, boxSizing:"border-box", backgroundColor:manualForm.carrier?C.white:C.bg }}>
                    <option value="">— Sin especificar —</option>
                    {tiposLista.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {/* Costo */}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMuted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                    Costo / unidad <span style={{ fontWeight:500, color:C.textMuted, textTransform:"none" }}>(default desde catálogo)</span>
                  </label>
                  <input type="number" min="0" value={manualForm.costoUnidad}
                    onChange={e => setManualForm(f => ({ ...f, costoUnidad: e.target.value }))}
                    placeholder="0"
                    style={{ width:"100%", padding:"9px 11px", borderRadius:7, border:"1px solid "+C.border, fontSize:13, fontWeight:700, color:C.green, boxSizing:"border-box" }} />
                </div>
                {/* Entregados / Intentados / No visitados */}
                <div style={{ gridColumn:"1 / -1", display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10, padding:"14px 16px", backgroundColor:C.bg, borderRadius:10, border:"1px solid "+C.border }}>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.green, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Entregados</label>
                    <input type="number" min="0" value={manualForm.entregados}
                      onChange={e => setManualForm(f => ({ ...f, entregados: e.target.value }))}
                      style={{ width:"100%", padding:"8px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:14, fontWeight:700, boxSizing:"border-box", textAlign:"center" }} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#CA8A04", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Intentados</label>
                    <input type="number" min="0" value={manualForm.intentados}
                      onChange={e => setManualForm(f => ({ ...f, intentados: e.target.value }))}
                      style={{ width:"100%", padding:"8px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:14, fontWeight:700, boxSizing:"border-box", textAlign:"center" }} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.red, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>No visitados</label>
                    <input type="number" min="0" value={manualForm.noVisitados}
                      onChange={e => setManualForm(f => ({ ...f, noVisitados: e.target.value }))}
                      style={{ width:"100%", padding:"8px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:14, fontWeight:700, boxSizing:"border-box", textAlign:"center" }} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.text, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Total (auto)</label>
                    <div style={{ width:"100%", padding:"8px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:16, fontWeight:800, boxSizing:"border-box", textAlign:"center", backgroundColor:C.white, color:C.text }}>{totalCalc}</div>
                  </div>
                </div>
                {/* HalfMile recolecciones */}
                {isHalfMile && (
                  <div style={{ gridColumn:"1 / -1", padding:"10px 14px", backgroundColor:C.blueBg, borderRadius:8, border:"1px solid "+C.blue, fontSize:12, color:C.text }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontWeight:700, color:C.blue }}>HalfMile / Crossdock</span>
                      <span style={{ color:C.textMuted }}>El costo/paq se calcula con los <b>entregados</b> (no se requieren recolecciones).</span>
                    </div>
                    <div style={{ marginTop:8 }}>
                      <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMuted, marginBottom:4, textTransform:"uppercase" }}>Recolecciones (opcional)</label>
                      <input type="number" min="0" value={manualForm.recolecciones}
                        onChange={e => setManualForm(f => ({ ...f, recolecciones: e.target.value }))}
                        style={{ width:160, padding:"7px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:13, fontWeight:700, boxSizing:"border-box", textAlign:"center" }} />
                    </div>
                  </div>
                )}
                {/* Datos extra del operador (auto-llenos pero editables) */}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMuted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Placa</label>
                  <input type="text" value={manualForm.placa}
                    onChange={e => setManualForm(f => ({ ...f, placa: e.target.value }))}
                    style={{ width:"100%", padding:"9px 11px", borderRadius:7, border:"1px solid "+C.border, fontSize:13, boxSizing:"border-box" }} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMuted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Correo operador</label>
                  <input type="email" value={manualForm.correo}
                    onChange={e => setManualForm(f => ({ ...f, correo: e.target.value }))}
                    style={{ width:"100%", padding:"9px 11px", borderRadius:7, border:"1px solid "+C.border, fontSize:13, boxSizing:"border-box" }} />
                </div>
              </div>
              <div style={{ padding:"16px 24px", borderTop:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <div style={{ fontSize:12, fontWeight:600, color: manualMsg.startsWith("✓") ? C.green : manualMsg.startsWith("⚠") ? "#CA8A04" : C.red, minHeight:18 }}>{manualMsg}</div>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={() => !manualSaving && setManualOpen(false)} disabled={manualSaving}
                    style={{ padding:"9px 20px", borderRadius:8, border:"1px solid "+C.border, backgroundColor:C.white, color:C.text, fontSize:13, fontWeight:600, cursor:manualSaving?"not-allowed":"pointer" }}>
                    Cancelar
                  </button>
                  <button onClick={saveManualRuta} disabled={manualSaving || !manualForm.carrier || !manualForm.operador || totalCalc === 0}
                    style={{ padding:"9px 22px", borderRadius:8, border:"none", backgroundColor:(manualSaving||!manualForm.carrier||!manualForm.operador||totalCalc===0)?C.textMuted:C.accent, color:"white", fontSize:13, fontWeight:700, cursor:(manualSaving||!manualForm.carrier||!manualForm.operador||totalCalc===0)?"not-allowed":"pointer" }}>
                    {manualSaving ? "Guardando..." : "Guardar ruta"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Prefactura provider selection modal */}
      {prefactOpen && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(12,20,37,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000 }}
          onClick={() => setPrefactOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor:C.white, borderRadius:14, padding:28, width:480, maxWidth:"92vw", boxShadow:"0 16px 48px rgba(0,0,0,0.28)" }}>
            <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:6 }}>Descargar prefactura</div>
            <div style={{ fontSize:12, color:C.textMuted, marginBottom:20 }}>
              Periodo: <b style={{ color:C.text }}>{new Date(fechaDesde+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})} — {new Date(fechaHasta+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}</b>
            </div>
            {proveedoresEnPeriodo.length === 0 ? (
              <div style={{ padding:18, backgroundColor:C.bg, borderRadius:8, fontSize:13, color:C.textMuted, textAlign:"center", marginBottom:18 }}>
                Sin asistencia registrada en este periodo. Ajusta las fechas o registra asistencia primero.
              </div>
            ) : (
              <>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Proveedor</label>
                <select value={prefactProveedor} onChange={e => {
                  const p = e.target.value;
                  setPrefactProveedor(p);
                  setPrefactOperaciones(OPERACIONES_CANONICAS.filter(op => conteoOperacion(p, op) > 0));
                }}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid "+C.accent, fontSize:14, fontWeight:700, color:C.text, backgroundColor:C.white, marginBottom:16, boxSizing:"border-box" }}>
                  {proveedoresEnPeriodo.map(p => {
                    const pNorm = norm(p);
                    const matches = rutas.filter(r => { const f = (r.salida||"").substring(0,10); return f >= fechaDesde && f <= fechaHasta && norm(r.carrier) === pNorm; });
                    const dias = new Set(matches.map(r => (r.salida||"").substring(0,10))).size;
                    const ops = matches.length;
                    return <option key={p} value={p}>{p} — {ops} rutas en {dias} días</option>;
                  })}
                </select>
                {(() => {
                  const opsDisp = OPERACIONES_CANONICAS;
                  const todasSeleccionadas = opsDisp.every(o => prefactOperaciones.includes(o));
                  return (
                    <div style={{ marginBottom:16 }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                        <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                          Tipo de operación <span style={{ fontWeight:500, textTransform:"none" }}>({prefactOperaciones.length}/{opsDisp.length})</span>
                        </label>
                        <button type="button"
                          onClick={() => setPrefactOperaciones(todasSeleccionadas ? [] : opsDisp)}
                          style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontSize:11, fontWeight:700, color:C.accent, textDecoration:"underline" }}>
                          {todasSeleccionadas ? "Quitar todas" : "Seleccionar todas"}
                        </button>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:6, padding:10, backgroundColor:C.bg, borderRadius:8, border:"1px solid "+C.border }}>
                        {opsDisp.map(o => {
                          const sel = prefactOperaciones.includes(o);
                          const cuenta = conteoOperacion(prefactProveedor, o);
                          const sinDatos = cuenta === 0;
                          return (
                            <label key={o} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 10px", borderRadius:6, backgroundColor:sel?C.accentLight:C.white, border:"1px solid "+(sel?C.accent:C.border), cursor:sinDatos&&!sel?"default":"pointer", fontSize:12, opacity:sinDatos&&!sel?0.55:1 }}>
                              <input type="checkbox" checked={sel}
                                onChange={() => setPrefactOperaciones(prev => sel ? prev.filter(x => x !== o) : [...prev, o])}
                                style={{ width:14, height:14, cursor:"pointer" }} />
                              <span style={{ fontWeight:700, color:sel?C.accent:C.text }}>{o}</span>
                              <span style={{ marginLeft:"auto", fontSize:10, color:sinDatos?C.textMuted:C.green, fontWeight:700 }}>{cuenta}</span>
                            </label>
                          );
                        })}
                      </div>
                      <div style={{ marginTop:6, fontSize:10, color:C.textMuted, fontStyle:"italic", lineHeight:1.4 }}>
                        Crossdock = "CrossDock" + "Logística Inversa" (es la misma unidad).<br />
                        Si una unidad está registrada con varios labels el mismo día, se cuenta una sola vez.
                      </div>
                    </div>
                  );
                })()}
                <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600, color:C.text, marginBottom:20, cursor:"pointer" }}>
                  <input type="checkbox" checked={prefactIVA} onChange={e => setPrefactIVA(e.target.checked)} style={{ width:16, height:16, cursor:"pointer" }} />
                  Incluir IVA (16%)
                </label>
              </>
            )}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
              <button onClick={() => setPrefactOpen(false)}
                style={{ padding:"9px 20px", borderRadius:8, border:"1px solid "+C.border, backgroundColor:C.white, fontSize:13, fontWeight:600, cursor:"pointer", color:C.text }}>
                Cancelar
              </button>
              <button onClick={() => { generatePrefactura(prefactProveedor, prefactIVA, prefactOperaciones); setPrefactOpen(false); }}
                disabled={!prefactProveedor || proveedoresEnPeriodo.length === 0 || prefactOperaciones.length === 0}
                style={{ padding:"9px 22px", borderRadius:8, border:"none", backgroundColor:(!prefactProveedor||proveedoresEnPeriodo.length===0||prefactOperaciones.length===0)?C.textMuted:C.green, color:"white", fontSize:13, fontWeight:700, cursor:(!prefactProveedor||proveedoresEnPeriodo.length===0||prefactOperaciones.length===0)?"not-allowed":"pointer" }}>
                Generar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal — replaces window.confirm() which can be permanently disabled by the browser */}
      {confirmModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(12,20,37,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}
          onClick={() => setConfirmModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: C.white, borderRadius: 12, padding: 28, width: 440, maxWidth: "90vw", boxShadow: "0 12px 48px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 10 }}>Confirmar eliminación</div>
            <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 22, lineHeight: 1.5 }}>{confirmModal.message}</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmModal(null)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid " + C.border, backgroundColor: C.white, fontSize: 13, fontWeight: 600, cursor: "pointer", color: C.text }}>Cancelar</button>
              <button onClick={async () => { const fn = confirmModal.onConfirm; setConfirmModal(null); try { await fn(); } catch (e) { console.error(e); alert("Error: " + e.message); } }} style={{ padding: "9px 22px", borderRadius: 8, border: "none", backgroundColor: C.red, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
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
  const [filtroProv, setFiltroProv] = useState("Todos");

  const LICENCIAS = ["A", "B", "C", "D", "E"];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    // Paginación por keyset sobre id — Supabase tiene tope de 1000 filas
    // por consulta. Sin esto, los operadores nuevos no aparecían cuando ya
    // había más de 1000 registrados.
    const loadAllOperadores = async () => {
      const byId = new Map();
      const pageSize = 1000;
      let cursor = null;
      while (true) {
        let q = supabase.from("operadores").select("*").order("id", { ascending: false }).limit(pageSize);
        if (cursor !== null) q = q.lt("id", cursor);
        const { data: chunk, error } = await q;
        if (error) { console.error("operadores load error:", error); break; }
        if (!chunk || chunk.length === 0) break;
        for (const row of chunk) byId.set(row.id, row);
        if (chunk.length < pageSize) break;
        cursor = chunk[chunk.length - 1].id;
      }
      return Array.from(byId.values()).sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" }));
    };
    const [ops, { data: cars }] = await Promise.all([
      loadAllOperadores(),
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
      // Each row = 1 operator: Col A=Nombre, Col B=Correo, Col C=Estatus
      const ops = [];
      for (let i = 0; i < rows.length; i++) {
        const nombre = String(rows[i]?.[0] || "").trim();
        const correo = String(rows[i]?.[1] || "").trim();
        const estatus = String(rows[i]?.[2] || "").trim() || "ACTIVE";
        if (nombre && !/^nombre/i.test(nombre)) ops.push({ nombre, correo, tipo: "Operador", estatus });
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
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
      const ops = [];
      for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(",").map(x => x.trim().replace(/^"|"$/g, ""));
        const nombre = cols[0] || "";
        const correo = cols[1] || "";
        const estatus = cols[2] || "ACTIVE";
        if (nombre && !/^nombre/i.test(nombre)) ops.push({ nombre, correo, tipo: "Operador", estatus });
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
  const proveedoresOps = [...new Set(operadores.map(o => o.proveedor).filter(Boolean))].sort();
  const filteredOps = filtroProv === "Todos" ? operadores : operadores.filter(o => o.proveedor === filtroProv);

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

      {/* Filtro por proveedor */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted }}>Filtrar por proveedor:</span>
        <select value={filtroProv} onChange={e => setFiltroProv(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer" }}>
          <option value="Todos">Todos los proveedores</option>
          {proveedoresOps.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {filtroProv !== "Todos" && <button onClick={() => setFiltroProv("Todos")} style={{ padding: "5px 10px", borderRadius: 6, border: "none", backgroundColor: C.redBg, color: C.red, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Limpiar</button>}
        <span style={{ fontSize: 12, color: C.textMuted, marginLeft: "auto" }}>{filteredOps.length} operador{filteredOps.length !== 1 ? "es" : ""}</span>
      </div>

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
              {filteredOps.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", color: C.textMuted }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>👤</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Sin operadores registrados</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Agrega operadores para usarlos en el check-in</div>
                </td></tr>
              ) : filteredOps.map((o) => (
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

  // Auto-refrescar al regresar a la pestaña — evita datos viejos cuando
  // un operador acaba de registrar asistencia desde su /checkin
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") loadData(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Keyset pagination on id (unique PK) so no duplicates or gaps even
    // when multiple rows share the same timestamp.
    const loadAllAsistencia = async () => {
      const byId = new Map();
      const pageSize = 1000;
      let cursor = null;
      while (true) {
        let q = supabase.from("asistencia").select("*").order("id", { ascending: false }).limit(pageSize);
        if (cursor !== null) q = q.lt("id", cursor);
        const { data: chunk } = await q;
        if (!chunk || chunk.length === 0) break;
        for (const row of chunk) byId.set(row.id, row);
        if (chunk.length < pageSize) break;
        cursor = chunk[chunk.length - 1].id;
      }
      return Array.from(byId.values()).sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || "") || b.id - a.id);
    };
    const [asiData, { data: carsData }] = await Promise.all([
      loadAllAsistencia(),
      supabase.from("carriers").select("*").order("proveedor"),
    ]);
    setAsistencia(asiData || []);
    setCarriers((carsData || []).filter(c => c.tipo_unidad && c.tipo_unidad !== "—"));
    setLoading(false);
  };

  const getCosto = r => parseFloat(carriers.find(c => c.proveedor === r.proveedor && c.tipo_unidad === r.tipo_unidad)?.costo_unidad) || 0;

  // Safe arithmetic formula evaluator. Supports +, -, *, /, parentheses,
  // decimal numbers, and the variable `costo`. Rejects any other character.
  const evalFormula = (expr, costo) => {
    if (!expr || !String(expr).trim()) return 0;
    let s = String(expr).replace(/costo/gi, "(" + (parseFloat(costo) || 0) + ")");
    if (!/^[\d+\-*/().\s]*$/.test(s)) return NaN; // reject any unsafe char
    try {
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + s + ')')();
      return (typeof result === "number" && isFinite(result)) ? result : NaN;
    } catch { return NaN; }
  };
  const getPenalizacion = r => {
    const v = evalFormula(r.penalizacion, getCosto(r));
    return isNaN(v) ? 0 : v;
  };
  const getCostoFinal = r => getCosto(r) + getPenalizacion(r);
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
  const totalPenal = filtrados.reduce((s, r) => s + getPenalizacion(r), 0);
  const totalReal = totalCosto + totalPenal;
  const totalUM = filtrados.filter(r => r.tipo_operacion === "Última Milla").reduce((s, r) => s + getCostoFinal(r), 0);
  const totalCD = filtrados.filter(r => r.tipo_operacion === "CrossDock").reduce((s, r) => s + getCostoFinal(r), 0);
  const totalLI = filtrados.filter(r => r.tipo_operacion === "Logística Inversa").reduce((s, r) => s + getCostoFinal(r), 0);

  const resumen = {};
  filtrados.forEach(r => {
    const key = r.fecha + "|" + r.proveedor;
    if (!resumen[key]) resumen[key] = { fecha: r.fecha, proveedor: r.proveedor, ops: 0, costo: 0, penal: 0, tipos: {} };
    resumen[key].ops += 1;
    resumen[key].costo += getCosto(r);
    resumen[key].penal += getPenalizacion(r);
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

  const savePenalizacion = async (id, value) => {
    setAsistencia(prev => prev.map(r => r.id === id ? { ...r, penalizacion: value } : r));
    try {
      const { error } = await supabase.from("asistencia").update({ penalizacion: value }).eq("id", id);
      if (error) throw error;
    } catch (err) {
      const msg = err?.message || String(err);
      if (/does not exist|schema cache/i.test(msg)) {
        setSaveMsg("⚠ Falta agregar la columna 'penalizacion' en la tabla asistencia. Ver consola para SQL.");
        console.warn("Ejecuta este SQL en Supabase:\n\nALTER TABLE asistencia ADD COLUMN penalizacion text;");
        setTimeout(() => setSaveMsg(""), 8000);
      }
    }
  };

  const exportarReporteCostos = () => {
    if (filtrados.length === 0) { alert("No hay registros en el rango seleccionado"); return; }
    const fechaStr = new Date().toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" });
    const periodo = filtroDesde === filtroHasta ? filtroDesde : `${filtroDesde} al ${filtroHasta}`;

    // Group by day
    const porDia = {};
    filtrados.forEach(r => {
      const d = (r.fecha || "").substring(0, 10);
      if (!porDia[d]) porDia[d] = { fecha: d, registros: [], costo: 0, penal: 0 };
      porDia[d].registros.push(r);
      porDia[d].costo += getCosto(r);
      porDia[d].penal += getPenalizacion(r);
    });
    const dias = Object.values(porDia).sort((a, b) => a.fecha.localeCompare(b.fecha));

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte de Costos ${periodo}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',-apple-system,sans-serif;color:#1F2937;padding:12mm 10mm;font-size:9.5pt}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #FF4500;padding-bottom:8px;margin-bottom:12px}
  .title{font-size:18pt;font-weight:800}
  .subtitle{font-size:9pt;color:#7C8495;margin-top:2px}
  .meta{font-size:8.5pt;color:#7C8495;text-align:right;line-height:1.5}
  .meta b{color:#1F2937}
  .stats{display:flex;gap:6px;margin-bottom:12px}
  .stat{flex:1;border:1px solid #E5E7EB;border-radius:6px;padding:7px 9px}
  .stat-label{font-size:7pt;font-weight:700;color:#7C8495;text-transform:uppercase}
  .stat-value{font-size:13pt;font-weight:800;margin-top:2px}
  h2{font-size:11pt;font-weight:700;margin:14px 0 6px}
  .day-header{background:#FFF4EF;padding:6px 10px;font-weight:700;font-size:10pt;color:#FF4500;border-radius:5px;margin-top:10px}
  table{width:100%;border-collapse:collapse;font-size:8.5pt;margin-top:4px}
  th{background:#F3F4F6;padding:5px 7px;text-align:left;font-size:7pt;font-weight:700;color:#7C8495;text-transform:uppercase;border-bottom:1px solid #E5E7EB}
  td{padding:5px 7px;border-bottom:1px solid #F1F5F9}
  .right{text-align:right}
  .day-total{background:#FAFBFF;font-weight:700}
  .day-total td{border-top:2px solid #D1D5DB;padding:6px 7px}
  .grand-total{margin-top:14px;border:2px solid #FF4500;border-radius:8px;padding:10px 14px;background:#FFF4EF;display:flex;justify-content:space-between;align-items:center;font-size:11pt;font-weight:800}
  .footer{margin-top:16px;padding-top:8px;border-top:1px solid #E5E7EB;font-size:7.5pt;color:#7C8495;text-align:center}
</style></head><body>
  <div class="header">
    <div>
      <div class="title">Reporte de Costos Reales</div>
      <div class="subtitle">Asistencia de operadores · Costos + Penalizaciones</div>
    </div>
    <div class="meta">
      <div><b>Periodo:</b> ${periodo}</div>
      <div><b>Proveedor:</b> ${filtroProv}</div>
      <div><b>Generado:</b> ${fechaStr}</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-label">Operadores</div><div class="stat-value">${filtrados.length}</div></div>
    <div class="stat"><div class="stat-label">Costo base</div><div class="stat-value" style="color:#16A34A">$${totalCosto.toLocaleString()}</div></div>
    <div class="stat"><div class="stat-label">Penalizaciones</div><div class="stat-value" style="color:${totalPenal>=0?"#DC2626":"#16A34A"}">${totalPenal>=0?"+":""}$${totalPenal.toLocaleString()}</div></div>
    <div class="stat"><div class="stat-label">Total real</div><div class="stat-value" style="color:#FF4500">$${totalReal.toLocaleString()}</div></div>
  </div>

  ${dias.map(d => `
    <div class="day-header">${new Date(d.fecha + "T00:00:00").toLocaleDateString("es-MX", {weekday:"long", day:"2-digit", month:"long", year:"numeric"})} · ${d.registros.length} operadores</div>
    <table>
      <thead><tr>
        <th>Operador</th><th>Hora</th><th>Proveedor</th><th>Unidad</th><th>Operación</th>
        <th class="right">Costo base</th><th>Penalización</th><th class="right">Penal. calc.</th><th class="right">Costo real</th>
      </tr></thead>
      <tbody>
        ${d.registros.map(r => {
          const co = getCosto(r);
          const pe = getPenalizacion(r);
          const tot = co + pe;
          const peStr = (r.penalizacion || "").trim();
          return `<tr>
            <td><b>${r.nombre_operador === "Registro manual" ? "(Manual)" : (r.nombre_operador || "—")}</b></td>
            <td>${fmt(r.timestamp)}</td>
            <td>${r.proveedor || "—"}</td>
            <td>${r.tipo_unidad || "—"}</td>
            <td>${r.tipo_operacion || "—"}</td>
            <td class="right">$${co.toLocaleString()}</td>
            <td style="font-family:monospace;font-size:8pt;color:#7C8495">${peStr || "—"}</td>
            <td class="right" style="color:${pe>0?"#DC2626":pe<0?"#16A34A":"#7C8495"}">${pe!==0?(pe>0?"+":"")+"$"+pe.toLocaleString():"—"}</td>
            <td class="right" style="font-weight:700;color:#1F2937">$${tot.toLocaleString()}</td>
          </tr>`;
        }).join("")}
        <tr class="day-total">
          <td colspan="5">Subtotal día</td>
          <td class="right">$${d.costo.toLocaleString()}</td>
          <td></td>
          <td class="right">${d.penal!==0?(d.penal>0?"+":"")+"$"+d.penal.toLocaleString():"$0"}</td>
          <td class="right" style="color:#FF4500">$${(d.costo+d.penal).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
  `).join("")}

  <div class="grand-total">
    <span>TOTAL GENERAL DEL PERIODO</span>
    <span>$${totalReal.toLocaleString()}</span>
  </div>

  <div class="footer">T1 OPS Envíos · Flotilla Propia · Los costos incluyen penalizaciones evaluadas de fórmulas</div>
</body></html>`;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) { alert("Permite ventanas emergentes para descargar el PDF"); return; }
    w.document.write(html);
    w.document.close();
    const script = w.document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js";
    script.onload = () => {
      setTimeout(() => {
        w.html2pdf().set({
          margin: [8, 8, 8, 8],
          filename: `Reporte_Costos_${filtroDesde}_${filtroHasta}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "letter", orientation: "landscape" },
        }).from(w.document.body).save().then(() => { setTimeout(() => w.close(), 500); });
      }, 600);
    };
    w.document.head.appendChild(script);
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
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={exportarReporteCostos} style={{ padding:"9px 16px", borderRadius:8, border:"none", backgroundColor:C.green, color:"white", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <IC.Download /> Descargar reporte
          </button>
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
          { label:"Costo base", value:fmtMoney(totalCosto), color:C.green },
          { label:"Penalizaciones", value:(totalPenal>=0?"+":"")+fmtMoney(Math.abs(totalPenal)), color:totalPenal>0?C.red:totalPenal<0?C.green:C.textMuted },
          { label:"Costo real", value:fmtMoney(totalReal), color:C.accent },
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

      {/* Resumen de costo por proveedor */}
      {filtrados.length > 0 && (() => {
        const resumenProv = {};
        filtrados.forEach(r => {
          const p = r.proveedor || "Sin proveedor";
          if (!resumenProv[p]) resumenProv[p] = { proveedor: p, costo: 0, ops: 0, um: 0, cd: 0, li: 0, costoUM: 0, costoCD: 0, costoLI: 0, tipos: {} };
          const c = getCosto(r);
          resumenProv[p].costo += c;
          resumenProv[p].ops += 1;
          resumenProv[p].tipos[r.tipo_unidad] = (resumenProv[p].tipos[r.tipo_unidad] || 0) + 1;
          if (r.tipo_operacion === "Última Milla") { resumenProv[p].um += 1; resumenProv[p].costoUM += c; }
          else if (r.tipo_operacion === "CrossDock") { resumenProv[p].cd += 1; resumenProv[p].costoCD += c; }
          else if (r.tipo_operacion === "Logística Inversa") { resumenProv[p].li += 1; resumenProv[p].costoLI += c; }
        });
        const resumenProvList = Object.values(resumenProv).sort((a, b) => b.costo - a.costo);
        return (
          <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, overflow:"hidden", marginBottom:16 }}>
            <div style={{ padding:"13px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Resumen de costo por proveedor</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                <button onClick={() => setFiltroProv("Todos")} style={{ padding:"4px 10px", borderRadius:6, border:"1px solid "+(filtroProv==="Todos"?C.accent:C.border), backgroundColor:filtroProv==="Todos"?C.accentLight:"transparent", color:filtroProv==="Todos"?C.accent:C.textMuted, fontSize:11, fontWeight:600, cursor:"pointer" }}>Todos</button>
                {resumenProvList.map(rp => (
                  <button key={rp.proveedor} onClick={() => setFiltroProv(filtroProv===rp.proveedor?"Todos":rp.proveedor)} style={{ padding:"4px 10px", borderRadius:6, border:"1px solid "+(filtroProv===rp.proveedor?C.blue:C.border), backgroundColor:filtroProv===rp.proveedor?C.blueBg:"transparent", color:filtroProv===rp.proveedor?C.blue:C.textMuted, fontSize:11, fontWeight:600, cursor:"pointer" }}>{rp.proveedor}</button>
                ))}
              </div>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ backgroundColor:C.bg }}>
                    {["Proveedor","Operadores","Tipos de unidad","Última Milla","CrossDock","Log. Inversa","Costo total","%"].map(h => (
                      <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resumenProvList.map((rp, i) => {
                    const pct = totalCosto > 0 ? ((rp.costo / totalCosto) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={i} style={{ borderTop:"1px solid "+C.border, cursor:"pointer", backgroundColor:filtroProv===rp.proveedor?C.blueBg+"88":"transparent" }}
                        onClick={() => setFiltroProv(filtroProv===rp.proveedor?"Todos":rp.proveedor)}
                        onMouseEnter={ev=>{if(filtroProv!==rp.proveedor)ev.currentTarget.style.backgroundColor="#FAFBFF"}}
                        onMouseLeave={ev=>{ev.currentTarget.style.backgroundColor=filtroProv===rp.proveedor?C.blueBg+"88":"transparent"}}>
                        <td style={{ padding:"10px 14px", fontSize:13, fontWeight:700, color:C.text }}>{rp.proveedor}</td>
                        <td style={{ padding:"10px 14px", fontSize:13, fontWeight:600 }}>{rp.ops}</td>
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                            {Object.entries(rp.tipos).map(([tipo, cnt]) => {
                              const tc = tipoColors[tipo] || {bg:"#F3F4F6",c:"#7C8495"};
                              return <span key={tipo} style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:4, backgroundColor:tc.bg, color:tc.c, whiteSpace:"nowrap" }}>{tipo} ×{cnt}</span>;
                            })}
                          </div>
                        </td>
                        <td style={{ padding:"10px 14px", fontSize:12 }}>
                          <span style={{ fontWeight:700, color:C.accent }}>${rp.costoUM.toLocaleString()}</span>
                          <span style={{ color:C.textMuted, fontSize:10, marginLeft:4 }}>({rp.um})</span>
                        </td>
                        <td style={{ padding:"10px 14px", fontSize:12 }}>
                          <span style={{ fontWeight:700, color:C.blue }}>${rp.costoCD.toLocaleString()}</span>
                          <span style={{ color:C.textMuted, fontSize:10, marginLeft:4 }}>({rp.cd})</span>
                        </td>
                        <td style={{ padding:"10px 14px", fontSize:12 }}>
                          <span style={{ fontWeight:700, color:C.purple }}>${rp.costoLI.toLocaleString()}</span>
                          <span style={{ color:C.textMuted, fontSize:10, marginLeft:4 }}>({rp.li})</span>
                        </td>
                        <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800, color:C.green }}>${rp.costo.toLocaleString()}</td>
                        <td style={{ padding:"10px 14px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ width:60, height:6, borderRadius:3, backgroundColor:C.border, overflow:"hidden" }}>
                              <div style={{ width:pct+"%", height:"100%", borderRadius:3, backgroundColor:C.green }} />
                            </div>
                            <span style={{ fontSize:11, fontWeight:600, color:C.textMuted }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ backgroundColor:"#FAFBFF", borderTop:"2px solid "+C.border }}>
                    <td style={{ padding:"10px 14px", fontSize:13, fontWeight:800 }}>TOTAL</td>
                    <td style={{ padding:"10px 14px", fontSize:13, fontWeight:800 }}>{filtrados.length}</td>
                    <td style={{ padding:"10px 14px" }} />
                    <td style={{ padding:"10px 14px", fontSize:12, fontWeight:800, color:C.accent }}>${totalUM.toLocaleString()}</td>
                    <td style={{ padding:"10px 14px", fontSize:12, fontWeight:800, color:C.blue }}>${totalCD.toLocaleString()}</td>
                    <td style={{ padding:"10px 14px", fontSize:12, fontWeight:800, color:C.purple }}>${totalLI.toLocaleString()}</td>
                    <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800, color:C.green }}>${totalCosto.toLocaleString()}</td>
                    <td style={{ padding:"10px 14px", fontSize:11, fontWeight:600, color:C.textMuted }}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

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
                  {["Fecha","Hora","Operador","Proveedor","Unidad","Operación","Costo","Penalización","Costo real",""].map(h => (
                    <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((r, i) => {
                  const costo = getCosto(r);
                  const penal = getPenalizacion(r);
                  const costoReal = costo + penal;
                  const tc = tipoColors[r.tipo_unidad] || {bg:"#F3F4F6",c:"#7C8495"};
                  const penalStr = r.penalizacion || "";
                  const penalInvalid = penalStr.trim() && isNaN(evalFormula(penalStr, costo));
                  return (
                    <tr key={r.id} style={{ borderTop:"1px solid "+C.border }}
                      onMouseEnter={ev=>ev.currentTarget.style.backgroundColor="#FAFBFF"}
                      onMouseLeave={ev=>ev.currentTarget.style.backgroundColor="transparent"}>
                      <td style={{ padding:"10px 14px", color:C.textMuted, whiteSpace:"nowrap" }}>{r.fecha}</td>
                      <td style={{ padding:"10px 14px", color:C.textMuted, whiteSpace:"nowrap" }}>{fmt(r.timestamp)}</td>
                      <td style={{ padding:"10px 14px", fontWeight:600, color:C.text }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                          {r.nombre_operador === "Registro manual"
                            ? <span style={{color:C.textMuted,fontStyle:"italic"}}>Manual</span>
                            : <span>{r.nombre_operador}</span>}
                          {(r.latitud != null && r.longitud != null) ? (
                            <span title="Registro automático vía /checkin (con geolocalización)"
                              style={{ fontSize:9, fontWeight:800, color:"#0284C7", padding:"2px 6px", borderRadius:10, backgroundColor:"#DBEAFE", letterSpacing:"0.05em" }}>
                              AUTO
                            </span>
                          ) : (
                            <span title="Registro capturado manualmente desde el panel"
                              style={{ fontSize:9, fontWeight:800, color:"#16A34A", padding:"2px 6px", borderRadius:10, backgroundColor:"#DCFCE7", letterSpacing:"0.05em" }}>
                              MANUAL
                            </span>
                          )}
                        </div>
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
                      <td style={{ padding:"8px 10px" }}>
                        <input type="text" defaultValue={penalStr}
                          onBlur={e => { if (e.target.value !== penalStr) savePenalizacion(r.id, e.target.value); }}
                          placeholder="ej: costo*0.1"
                          title="Fórmula: puedes usar 'costo' y operadores + - * / y paréntesis. Ej: costo*0.1, -50, 100+25"
                          style={{ width:120, padding:"5px 8px", borderRadius:5, border:"1px solid "+(penalInvalid?C.red:C.border), fontSize:11, fontFamily:"monospace", backgroundColor:penalInvalid?C.redBg:C.white }} />
                      </td>
                      <td style={{ padding:"10px 14px", fontWeight:800, color:penal!==0?(penal>0?C.red:C.green):C.text }}>
                        ${costoReal.toLocaleString()}
                        {penal!==0 && <div style={{fontSize:9,fontWeight:600,color:penal>0?C.red:C.green}}>{penal>0?"+":""}${penal.toLocaleString()}</div>}
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
  const [sesionNombre, setSesionNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [mapMode, setMapMode] = useState("click");
  const [bulkCluster, setBulkCluster] = useState(0);
  const [guiaKey, setGuiaKey] = useState("");
  const [rawRows, setRawRows] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [mapMaximized, setMapMaximized] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const mapDivRef = useRef(null);
  const canvasRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const sesionIdRef = useRef("");
  const selectedRef = useRef(new Set());
  const puntosRef = useRef([]);
  const mapModeRef = useRef("click");
  const redrawTimerRef = useRef(null);

  const DEPOSITO_LAT = 19.398892731487283;
  const DEPOSITO_LNG = -99.11677448852873;
  const RCOLORS = ['#E63B2E','#2563EB','#16A34A','#D97706','#7C3AED','#EC4899','#0891B2','#059669','#F97316','#4B5563','#DC2626','#1D4ED8','#15803D','#B45309','#6D28D9'];

  useEffect(() => { sesionIdRef.current = sesionId; }, [sesionId]);
  useEffect(() => { selectedRef.current = selectedIndices; }, [selectedIndices]);
  useEffect(() => { puntosRef.current = puntos; }, [puntos]);
  useEffect(() => { mapModeRef.current = mapMode; }, [mapMode]);

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
    };
  }, []);

  // Toggle map dragging when switching modes
  useEffect(() => {
    if (!leafletMapRef.current) return;
    if (mapMode === "lasso") {
      leafletMapRef.current.dragging.disable();
      leafletMapRef.current.scrollWheelZoom.disable();
    } else {
      leafletMapRef.current.dragging.enable();
      leafletMapRef.current.scrollWheelZoom.enable();
    }
  }, [mapMode]);

  // Ray-casting point-in-polygon
  const pip = (x, y, poly) => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };

  const setupLasso = (map) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = map.getContainer().offsetWidth;
    canvas.height = map.getContainer().offsetHeight;
    const ctx = canvas.getContext("2d");
    let drawing = false;
    let path = [];

    canvas.addEventListener("mousedown", e => {
      if (mapModeRef.current !== "lasso") return;
      e.preventDefault();
      drawing = true;
      path = [];
      const r = canvas.getBoundingClientRect();
      path.push({ x: e.clientX - r.left, y: e.clientY - r.top });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener("mousemove", e => {
      if (!drawing || mapModeRef.current !== "lasso") return;
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      path.push({ x: e.clientX - r.left, y: e.clientY - r.top });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = "#7C3AED";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.fillStyle = "rgba(124,58,237,0.08)";
      ctx.fill();
    });

    canvas.addEventListener("mouseup", () => {
      if (!drawing || mapModeRef.current !== "lasso") return;
      drawing = false;
      if (path.length > 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        path.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.strokeStyle = "#7C3AED";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.fillStyle = "rgba(124,58,237,0.15)";
        ctx.fill();
        ctx.stroke();
        const pts = puntosRef.current;
        const L = window.L;
        const inside = new Set();
        pts.forEach((p, i) => {
          const cp = map.latLngToContainerPoint(L.latLng(p.lat, p.lng));
          if (pip(cp.x, cp.y, path)) inside.add(i);
        });
        if (inside.size > 0) {
          setSelectedIndices(prev => { const next = new Set(prev); inside.forEach(i => next.add(i)); return next; });
        }
      }
      setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 1200);
    });

    canvas.addEventListener("mouseleave", () => {
      if (drawing) { drawing = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    });
  };

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
    setSelectedIndices(new Set());
    drawMarkers(map, puntos, asignaciones, numClusters, new Set(), guiaKey);
    map.fitBounds(puntos.map(p => [p.lat, p.lng]), { padding: [40, 40] });
    setupLasso(map);
  }, [leafletLoaded, puntos]);

  // Redraw markers when assignments, selection, or guía key changes (debounced for performance)
  useEffect(() => {
    if (!leafletMapRef.current || puntos.length === 0) return;
    if (redrawTimerRef.current) clearTimeout(redrawTimerRef.current);
    redrawTimerRef.current = setTimeout(() => {
      if (leafletMapRef.current) drawMarkers(leafletMapRef.current, puntos, asignaciones, numClusters, selectedIndices, guiaKey);
    }, 40);
  }, [asignaciones, selectedIndices, guiaKey]);

  // Invalidate map size when maximized state changes
  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => leafletMapRef.current && leafletMapRef.current.invalidateSize(), 80);
    }
  }, [mapMaximized]);

  const drawMarkers = (map, pts, assigns, nk, selSet, gKey) => {
    const L = window.L;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    pts.forEach((p, i) => {
      const cl = assigns[i] ?? 0;
      const isExcluded = cl === -1;
      const color = isExcluded ? "#94A3B8" : RCOLORS[cl % RCOLORS.length];
      const isSel = selSet && selSet.has(i);
      const w = isSel ? 36 : 30;
      const h = isSel ? 50 : 42;
      const labelTxt = isExcluded ? "✕" : String(cl + 1);
      const fontSize = isExcluded ? 11 : (labelTxt.length >= 2 ? 10 : 12);
      const pinHtml = `<div style="cursor:pointer;opacity:${isExcluded ? 0.55 : 1};filter:${isSel ? "drop-shadow(0 0 6px #FACC15)" : "drop-shadow(0 2px 4px rgba(0,0,0,0.4))"}">
        <svg width="${w}" height="${h}" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1C6.477 1 2 5.477 2 11c0 8.5 10 19 10 19s10-10.5 10-19C24 5.477 19.523 1 12 1z" fill="${color}" stroke="${isSel ? "#FACC15" : "white"}" stroke-width="${isSel ? 2.5 : 1.5}"/>
          <text x="12" y="12" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="${fontSize}" font-weight="800" font-family="sans-serif">${labelTxt}</text>
        </svg>
      </div>`;
      const icon = L.divIcon({ html: pinHtml, className: "", iconSize: [w, h], iconAnchor: [w / 2, h] });
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
      const guiaVal = gKey && p[gKey] ? String(p[gKey]) : "";
      if (guiaVal) {
        marker.bindTooltip(`<b style="font-family:monospace;font-size:13px;">${guiaVal}</b>`, {
          permanent: false, direction: "top", offset: [0, -h + 4]
        });
      }
      marker.on("click", () => {
        if (mapModeRef.current !== "click") return;
        setSelectedIndices(prev => {
          const next = new Set(prev);
          if (next.has(i)) next.delete(i); else next.add(i);
          return next;
        });
      });
      markersRef.current.push(marker);
    });
  };

  const applyBulk = () => {
    const indices = Array.from(selectedIndices);
    if (!indices.length) return;
    const nc = bulkCluster;
    setAsignaciones(prev => { const next = [...prev]; indices.forEach(i => next[i] = nc); return next; });
    const sid = sesionIdRef.current;
    if (sid) Promise.all(indices.map(i => supabase.from("ruteo_puntos").update({ cluster: nc, ruta: "Ruta " + (nc + 1) }).eq("sesion", sid).eq("indice", i)));
    setSelectedIndices(new Set());
    setMsg(`✓ ${indices.length} punto(s) reasignados a Ruta ${nc + 1}.`);
  };

  const excludeFromRoute = () => {
    const indices = Array.from(selectedIndices);
    if (!indices.length) return;
    setAsignaciones(prev => { const next = [...prev]; indices.forEach(i => next[i] = -1); return next; });
    const sid = sesionIdRef.current;
    if (sid) Promise.all(indices.map(i => supabase.from("ruteo_puntos").update({ cluster: -1, ruta: "Excluido" }).eq("sesion", sid).eq("indice", i)));
    setSelectedIndices(new Set());
    setMsg(`✓ ${indices.length} punto(s) excluidos de ruta — no saldrán del almacén.`);
  };

  const includeInRoute = () => {
    const indices = Array.from(selectedIndices);
    if (!indices.length) return;
    const nc = bulkCluster;
    setAsignaciones(prev => { const next = [...prev]; indices.forEach(i => next[i] = nc); return next; });
    const sid = sesionIdRef.current;
    if (sid) Promise.all(indices.map(i => supabase.from("ruteo_puntos").update({ cluster: nc, ruta: "Ruta " + (nc + 1) }).eq("sesion", sid).eq("indice", i)));
    setSelectedIndices(new Set());
    setMsg(`✓ ${indices.length} punto(s) reincluidos en Ruta ${nc + 1}.`);
  };

  // ================================================================
  // Capacity-Constrained Power Diagrams (CCPD) + Time-Dependent
  // routing optimized with Guided Local Search (GLS) over 2-opt.
  //
  //   1. KMeans++ seeding for centroids.
  //   2. Power Diagram assignment: each point goes to the centroid
  //      that minimizes the *power distance*  d²(p,c) - w(c).
  //      Adjusting the weights w(c) balances cluster capacities
  //      (all clusters tend toward |pts|/k points).
  //   3. Lloyd centroid update.
  //   4. Per-cluster TSP ordering refined with Guided Local Search
  //      using a time-dependent edge cost (later visits cost more).
  // ================================================================
  const kMeans = (pts, k) => {
    if (!pts.length || k < 1) return [];
    const n = pts.length;
    const targetCap = n / k;

    // --- KMeans++ centroid seeding ---
    const centers = [{ lat: pts[Math.floor(Math.random() * n)].lat, lng: pts[Math.floor(Math.random() * n)].lng }];
    while (centers.length < k) {
      const dists = pts.map(p => Math.min(...centers.map(c => (p.lat - c.lat) ** 2 + (p.lng - c.lng) ** 2)));
      const total = dists.reduce((s, d) => s + d, 0);
      let r = Math.random() * total, chosen = pts[n - 1];
      for (let j = 0; j < n; j++) { r -= dists[j]; if (r <= 0) { chosen = pts[j]; break; } }
      centers.push({ lat: chosen.lat, lng: chosen.lng });
    }

    // --- Power Diagram + capacity-constrained Lloyd iterations ---
    let weights = new Array(k).fill(0);
    let assigns = new Array(n).fill(0);
    const powerDist = (p, c, w) => (p.lat - c.lat) ** 2 + (p.lng - c.lng) ** 2 - w;
    const lr = 5e-7; // weight learning rate (in deg² units)

    for (let it = 0; it < 150; it++) {
      const na = pts.map(p => {
        let md = Infinity, nr = 0;
        for (let ci = 0; ci < k; ci++) {
          const d = powerDist(p, centers[ci], weights[ci]);
          if (d < md) { md = d; nr = ci; }
        }
        return nr;
      });
      // Update centroids (Lloyd step)
      for (let ci = 0; ci < k; ci++) {
        const cp = pts.filter((_, i) => na[i] === ci);
        if (cp.length) centers[ci] = {
          lat: cp.reduce((s, p) => s + p.lat, 0) / cp.length,
          lng: cp.reduce((s, p) => s + p.lng, 0) / cp.length,
        };
      }
      // Adjust weights to balance capacities: oversized clusters
      // get smaller weights (push points away), undersized get larger.
      const sizes = new Array(k).fill(0);
      na.forEach(a => sizes[a]++);
      weights = weights.map((w, ci) => w + lr * (targetCap - sizes[ci]));

      if (na.every((a, i) => a === assigns[i])) { assigns = na; break; }
      assigns = na;
    }

    // --- Compact cluster IDs to 0..N-1 with no gaps ---
    const used = [...new Set(assigns)].sort((a, b) => a - b);
    if (used.length < k) {
      const remap = {};
      used.forEach((c, i) => { remap[c] = i; });
      assigns = assigns.map(a => remap[a]);
    }

    // --- Per-cluster TSP ordering with Guided Local Search (2-opt) ---
    // Time-dependent edge cost: visit i→j taking place at sequence
    // position p has an extra (1 + p*tau) multiplier that simulates
    // increasing congestion later in the route.
    const numClustersFinal = Math.max(...assigns) + 1;
    const tau = 0.02; // time-dependent decay factor
    const haver = (a, b) => {
      const R = 6371, toR = d => d * Math.PI / 180;
      const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
      const s = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(s));
    };
    const tdCost = (a, b, pos) => haver(a, b) * (1 + pos * tau);

    // Per-point sequence position (1-based) within its cluster after GLS
    const seqOrder = new Array(n).fill(0);

    for (let ci = 0; ci < numClustersFinal; ci++) {
      const idxs = [];
      pts.forEach((_, i) => { if (assigns[i] === ci) idxs.push(i); });
      if (idxs.length <= 2) { idxs.forEach((gi, lp) => { seqOrder[gi] = lp; }); continue; }

      // Greedy nearest-neighbor seed tour starting at the centroid-closest point
      let startIdx = idxs[0], minD = Infinity;
      idxs.forEach(gi => {
        const d = (pts[gi].lat - centers[ci].lat) ** 2 + (pts[gi].lng - centers[ci].lng) ** 2;
        if (d < minD) { minD = d; startIdx = gi; }
      });
      const remaining = new Set(idxs);
      remaining.delete(startIdx);
      const tour = [startIdx];
      while (remaining.size) {
        const last = pts[tour[tour.length - 1]];
        let best = null, bestD = Infinity;
        remaining.forEach(gi => {
          const d = haver(last, pts[gi]);
          if (d < bestD) { bestD = d; best = gi; }
        });
        tour.push(best);
        remaining.delete(best);
      }

      // Guided Local Search: penalize most-utilized edges to escape local optima
      const m = tour.length;
      const penalties = {}; // key: "min-max" of point indices in tour position
      const lambda = 0.1;
      const tourCost = (t, pen) => {
        let s = 0;
        for (let i = 0; i < t.length - 1; i++) {
          const key = Math.min(t[i], t[i + 1]) + "-" + Math.max(t[i], t[i + 1]);
          s += tdCost(pts[t[i]], pts[t[i + 1]], i) + lambda * (pen[key] || 0);
        }
        return s;
      };
      const augmentedCost = c => c;

      const twoOpt = t => {
        let improved = true, best = [...t];
        while (improved) {
          improved = false;
          for (let i = 1; i < best.length - 2; i++) {
            for (let j = i + 1; j < best.length - 1; j++) {
              const cand = [...best.slice(0, i), ...best.slice(i, j + 1).reverse(), ...best.slice(j + 1)];
              if (augmentedCost(tourCost(cand, penalties)) < augmentedCost(tourCost(best, penalties)) - 1e-9) {
                best = cand; improved = true;
              }
            }
          }
        }
        return best;
      };

      let current = twoOpt(tour);
      let bestEver = [...current];
      let bestEverCost = tourCost(current, {});
      const glsIters = Math.min(10, Math.max(3, Math.floor(40 / m)));
      for (let g = 0; g < glsIters; g++) {
        // Penalize edges with highest utility = cost / (1 + penalty)
        let maxUtil = -1, worstKey = null;
        for (let i = 0; i < current.length - 1; i++) {
          const key = Math.min(current[i], current[i + 1]) + "-" + Math.max(current[i], current[i + 1]);
          const c = haver(pts[current[i]], pts[current[i + 1]]);
          const util = c / (1 + (penalties[key] || 0));
          if (util > maxUtil) { maxUtil = util; worstKey = key; }
        }
        if (worstKey) penalties[worstKey] = (penalties[worstKey] || 0) + 1;
        current = twoOpt(current);
        const realCost = tourCost(current, {});
        if (realCost < bestEverCost) { bestEverCost = realCost; bestEver = [...current]; }
      }

      bestEver.forEach((gi, lp) => { seqOrder[gi] = lp; });
    }

    // Stash sequence order on assignment objects for the caller via closure
    kMeans._lastSeqOrder = seqOrder;
    return assigns;
  };
  kMeans._lastSeqOrder = null;

  const handleFile = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset sesionId too — without this, the next "Generar rutas" call on the
    // new file would reuse the old session id and either overwrite the
    // previous session's data or create duplicates depending on the path.
    setLoading(true); setMsg(""); setPuntos([]); setAsignaciones([]); setRawRows([]); setFileInfo(null); setSesionId(""); setSesionNombre("");
    try {
      let rows = [];
      // Use XLSX for both CSV and Excel for robust parsing
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
      rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      const sample = rows[0] || {};
      const keys = Object.keys(sample);
      const latK = keys.find(k => /^lat$/i.test(k.trim())) || keys.find(k => /latit/i.test(k)) || "Latitud";
      const lngK = keys.find(k => /^(lng|lon)$/i.test(k.trim())) || keys.find(k => /longit|^lng$|^lon$/i.test(k)) || "Longitud";
      const guiaK = keys.find(k => /tracking/i.test(k))
        || keys.find(k => /guia|guía|n[uú]m.*guia|no\.?\s*gu[ií]a|guide/i.test(k)) || "";
      setGuiaKey(guiaK);
      const pts = rows.map((r, i) => {
        const rawLat = r[latK]; const rawLng = r[lngK];
        const lat = parseFloat(String(rawLat).replace(",", ".")) || 0;
        const lng = parseFloat(String(rawLng).replace(",", ".")) || 0;
        return { ...r, lat, lng, _i: i };
      }).filter(p => p.lat !== 0 && p.lng !== 0);
      if (!pts.length) { setMsg("Sin coordenadas válidas. Asegúrate de que el archivo tenga columnas de Latitud y Longitud (ej: lat, Latitud, latitude, lng, Longitud, lon)."); setLoading(false); return; }
      setRawRows(pts);
      setFileInfo({ count: pts.length, name: file.name });
      setMsg("");
    } catch (err) { setMsg("Error: " + err.message); }
    setLoading(false);
  };

  const generateRoutes = async () => {
    if (!rawRows.length) return;
    setLoading(true); setMsg("");
    try {
      const pts = rawRows;
      const k = Math.min(numClusters, pts.length);
      const assigns = kMeans(pts, k);
      setPuntos(pts);
      setAsignaciones(assigns);
      // Reuse the existing sesionId when the loaded points match rawRows
      // exactly (clicking "Generar" twice on the same file). Without this
      // every click created an orphan duplicate session in the historico.
      const reuse = !!sesionId && puntos.length === pts.length && puntos.length > 0;
      let sid;
      if (reuse) {
        sid = sesionId;
        await supabase.from("ruteo_puntos").delete().eq("sesion", sid);
      } else {
        sid = "S" + Date.now();
        setSesionId(sid);
      }
      const nombreTrim = (sesionNombre || "").trim() || null;
      // Detecta si la BD tiene la columna `nombre` (sino la quita del payload)
      const probeNombre = await supabase.from("ruteo_puntos").select("nombre").limit(1);
      const tieneNombre = !probeNombre.error;
      const dbRows = pts.map((p, i) => {
        const row = { sesion: sid, indice: i, latitud: p.lat, longitud: p.lng, cluster: assigns[i], ruta: "Ruta " + (assigns[i] + 1), datos_extra: JSON.stringify(Object.fromEntries(Object.entries(p).filter(([k]) => !["lat", "lng", "_i"].includes(k)))) };
        if (tieneNombre) row.nombre = nombreTrim;
        return row;
      });
      // Chunked insert (500 rows/batch) to avoid payload size issues
      for (let bi = 0; bi < dbRows.length; bi += 500) {
        await supabase.from("ruteo_puntos").insert(dbRows.slice(bi, bi + 500));
      }
      setMsg(`✓ ${pts.length} puntos clusterizados en ${k} rutas${reuse ? " (sesión actualizada)" : ""}${nombreTrim && tieneNombre ? ` · "${nombreTrim}"` : ""}${nombreTrim && !tieneNombre ? " · (corre ALTER TABLE ruteo_puntos ADD COLUMN nombre text para guardar el nombre)" : ""}.`);
    } catch (err) { setMsg("Error: " + err.message); }
    setLoading(false);
  };

  const reCluster = async () => {
    if (!puntos.length) return;
    setLoading(true);
    const k = Math.min(numClusters, puntos.length);
    const assigns = kMeans(puntos, k);
    setAsignaciones(assigns);
    // Persist to DB: delete old rows and re-insert with new clusters
    if (sesionId) {
      await supabase.from("ruteo_puntos").delete().eq("sesion", sesionId);
      const nombreTrim = (sesionNombre || "").trim() || null;
      const probeNombre = await supabase.from("ruteo_puntos").select("nombre").limit(1);
      const tieneNombre = !probeNombre.error;
      const dbRows = puntos.map((p, i) => {
        const row = {
          sesion: sesionId, indice: i, latitud: p.lat, longitud: p.lng,
          cluster: assigns[i], ruta: "Ruta " + (assigns[i] + 1),
          datos_extra: JSON.stringify(Object.fromEntries(Object.entries(p).filter(([k]) => !["lat", "lng", "_i"].includes(k))))
        };
        if (tieneNombre) row.nombre = nombreTrim;
        return row;
      });
      for (let bi = 0; bi < dbRows.length; bi += 500) {
        await supabase.from("ruteo_puntos").insert(dbRows.slice(bi, bi + 500));
      }
    }
    setMsg(`✓ Re-clusterizado con ${k} rutas. ${sesionId ? "Guardado." : ""}`);
    setLoading(false);
  };

  // Paginated fetch to bypass Supabase's default 1000-row cap
  const fetchAllRuteoPuntos = async (queryBuilder) => {
    let all = [];
    const pageSize = 1000;
    let from = 0;
    while (true) {
      const { data: chunk } = await queryBuilder().range(from, from + pageSize - 1);
      if (!chunk || chunk.length === 0) break;
      all = all.concat(chunk);
      if (chunk.length < pageSize) break;
      from += pageSize;
    }
    return all;
  };

  const loadHistorico = async () => {
    setLoadingHist(true);
    // Probe nombre + paginación por keyset sobre id (los puntos de una misma
    // sesión comparten created_at; offset+ORDER BY created_at se salta filas).
    const probe = await supabase.from("ruteo_puntos").select("sesion, created_at, cluster, nombre").limit(1);
    const cols = probe.error ? "id, sesion, created_at, cluster" : "id, sesion, created_at, cluster, nombre";
    const byId = new Map();
    const pageSize = 1000;
    let cursor = null;
    while (true) {
      let q = supabase.from("ruteo_puntos").select(cols).order("id", { ascending: false }).limit(pageSize);
      if (cursor !== null) q = q.lt("id", cursor);
      const { data: chunk, error } = await q;
      if (error) { console.error("loadHistorico error:", error); break; }
      if (!chunk || chunk.length === 0) break;
      for (const row of chunk) byId.set(row.id, row);
      if (chunk.length < pageSize) break;
      cursor = chunk[chunk.length - 1].id;
    }
    const data = Array.from(byId.values());
    if (data && data.length > 0) {
      const grouped = {};
      data.forEach(r => {
        if (!grouped[r.sesion]) grouped[r.sesion] = { sesion: r.sesion, fecha: r.created_at, nombre: r.nombre || null, puntos: 0, rutas: new Set() };
        grouped[r.sesion].puntos += 1;
        grouped[r.sesion].rutas.add(r.cluster);
        if (!grouped[r.sesion].nombre && r.nombre) grouped[r.sesion].nombre = r.nombre;
      });
      setHistorico(Object.values(grouped).map(g => ({ ...g, rutas: g.rutas.size })).sort((a, b) => b.fecha.localeCompare(a.fecha)));
    }
    setLoadingHist(false);
  };

  const loadSesion = async (sid) => {
    setLoading(true); setMsg("");
    const data = await fetchAllRuteoPuntos(() => supabase.from("ruteo_puntos").select("*").eq("sesion", sid).order("indice"));
    if (data && data.length > 0) {
      const pts = data.map(r => {
        const extra = r.datos_extra ? (typeof r.datos_extra === "string" ? JSON.parse(r.datos_extra) : r.datos_extra) : {};
        return { ...extra, lat: r.latitud, lng: r.longitud, _i: r.indice };
      });
      const assigns = data.map(r => r.cluster);
      const maxCluster = Math.max(...assigns) + 1;
      // Detect guia key from extra data
      const sample = pts[0] || {};
      const gk = Object.keys(sample).find(k => /tracking/i.test(k)) || Object.keys(sample).find(k => /guia|guía/i.test(k)) || "";
      setGuiaKey(gk);
      setPuntos(pts);
      setRawRows(pts);
      setAsignaciones(assigns);
      setNumClusters(maxCluster);
      setSesionId(sid);
      setSesionNombre(data[0]?.nombre || "");
      setFileInfo({ count: pts.length, name: "Sesión " + sid.substring(0, 10) });
      setMsg(`✓ Sesión ${sid.substring(0, 10)} cargada — ${pts.length} puntos, ${maxCluster} rutas.`);
      setShowHistorico(false);
    } else {
      setMsg("No se encontraron puntos para esta sesión.");
    }
    setLoading(false);
  };

  const exportHistMapHTML = async (sid) => {
    const data = await fetchAllRuteoPuntos(() => supabase.from("ruteo_puntos").select("*").eq("sesion", sid).order("indice"));
    if (!data || data.length === 0) return;
    const pts = data.map(r => {
      const extra = r.datos_extra ? (typeof r.datos_extra === "string" ? JSON.parse(r.datos_extra) : r.datos_extra) : {};
      return { ...extra, lat: r.latitud, lng: r.longitud, cluster: r.cluster };
    });
    const gk = Object.keys(pts[0]).find(k => /tracking/i.test(k)) || Object.keys(pts[0]).find(k => /guia|guía/i.test(k)) || "";
    const cc = {};
    pts.forEach(p => { cc[p.cluster] = (cc[p.cluster] || 0) + 1; });
    const markers = pts.map(p => {
      const color = RCOLORS[p.cluster % RCOLORS.length];
      const label = gk && p[gk] ? String(p[gk]) : "";
      return `L.circleMarker([${p.lat},${p.lng}],{radius:7,fillColor:"${color}",color:"white",weight:2,fillOpacity:0.9}).addTo(map).bindPopup("<b>Ruta ${p.cluster+1}</b>${label ? "<br/>"+label : ""}<br/>${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}");`;
    }).join("\n");
    const legend = Object.entries(cc).sort((a,b)=>+a[0]-+b[0]).map(([cl,cnt])=>{
      const color = RCOLORS[+cl % RCOLORS.length];
      return `<div style="display:flex;align-items:center;gap:6px;margin:3px 0"><div style="width:12px;height:12px;border-radius:50%;background:${color}"></div><span>Ruta ${+cl+1} — ${cnt} pts</span></div>`;
    }).join("");
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Mapa Ruteo — ${sid}</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>body{margin:0;font-family:Arial,sans-serif}#map{height:100vh;width:100%}.legend{position:absolute;bottom:20px;left:20px;background:white;padding:14px 18px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.15);z-index:1000;font-size:13px;max-height:60vh;overflow-y:auto}.legend h4{margin:0 0 8px;font-size:14px}</style>
</head><body>
<div id="map"></div>
<div class="legend"><h4>T1 Envíos — Ruteo</h4><div style="font-size:11px;color:#666;margin-bottom:8px">${pts.length} puntos · ${Object.keys(cc).length} rutas · ${sid.substring(0,10)}</div>${legend}</div>
<script>
var map=L.map("map").setView([${DEPOSITO_LAT},${DEPOSITO_LNG}],12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);
L.marker([${DEPOSITO_LAT},${DEPOSITO_LNG}]).addTo(map).bindPopup("<b>Almacén T1</b>");
${markers}
map.fitBounds([${pts.map(p=>`[${p.lat},${p.lng}]`).join(",")}],{padding:[40,40]});
<\/script>
</body></html>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    a.download = `mapa_${sid.substring(0,10)}.html`;
    a.click();
  };

  const deleteHistSesion = async (sid) => {
    if (!confirm("¿Eliminar esta sesión de ruteo?")) return;
    await supabase.from("ruteo_puntos").delete().eq("sesion", sid);
    setHistorico(prev => prev.filter(h => h.sesion !== sid));
  };

  const exportCSV = () => {
    if (!puntos.length) return;
    const extraK = Object.keys(puntos[0]).filter(k => !["lat", "lng", "_i"].includes(k) && k !== guiaKey);
    const hdr = ["Tracking Number", "Cluster", "Latitud", "Longitud", ...extraK];
    const body = puntos.map((p, i) => {
      const cl = asignaciones[i] ?? 0;
      const tracking = guiaKey ? `"${(p[guiaKey] || "").toString().replace(/"/g, '""')}"` : "";
      return [tracking, cl + 1, p.lat, p.lng, ...extraK.map(k => `"${(p[k] || "").toString().replace(/"/g, '""')}"`)].join(",");
    });
    const csv = [hdr.join(","), ...body].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    a.download = "ruteo_clusters.csv";
    a.click();
  };

  const exportMapHTML = () => {
    if (!puntos.length) return;
    const markers = puntos.map((p, i) => {
      const cl = asignaciones[i] ?? 0;
      const color = RCOLORS[cl % RCOLORS.length];
      const label = guiaKey && p[guiaKey] ? String(p[guiaKey]) : "";
      return `L.circleMarker([${p.lat},${p.lng}],{radius:7,fillColor:"${color}",color:"white",weight:2,fillOpacity:0.9}).addTo(map).bindPopup("<b>Ruta ${cl+1}</b>${label ? "<br/>"+label : ""}<br/>${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}");`;
    }).join("\n");
    const legend = Object.entries(clusterCount).sort((a,b)=>+a[0]-+b[0]).map(([cl,cnt])=>{
      const color = RCOLORS[+cl % RCOLORS.length];
      return `<div style="display:flex;align-items:center;gap:6px;margin:3px 0"><div style="width:12px;height:12px;border-radius:50%;background:${color}"></div><span>Ruta ${+cl+1} — ${cnt} pts</span></div>`;
    }).join("");
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Mapa Ruteo — T1 Envíos</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>body{margin:0;font-family:Arial,sans-serif}#map{height:100vh;width:100%}.legend{position:absolute;bottom:20px;left:20px;background:white;padding:14px 18px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.15);z-index:1000;font-size:13px;max-height:60vh;overflow-y:auto}.legend h4{margin:0 0 8px;font-size:14px}</style>
</head><body>
<div id="map"></div>
<div class="legend"><h4>T1 Envíos — Ruteo</h4><div style="font-size:11px;color:#666;margin-bottom:8px">${puntos.length} puntos · ${Object.keys(clusterCount).length} rutas</div>${legend}</div>
<script>
var map=L.map("map").setView([${DEPOSITO_LAT},${DEPOSITO_LNG}],12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);
L.marker([${DEPOSITO_LAT},${DEPOSITO_LNG}]).addTo(map).bindPopup("<b>Almacén T1</b>");
${markers}
map.fitBounds([${puntos.map(p=>`[${p.lat},${p.lng}]`).join(",")}],{padding:[40,40]});
<\/script>
</body></html>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    a.download = "mapa_ruteo.html";
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
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportMapHTML} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid " + C.blue, backgroundColor: C.blueBg, color: C.blue, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <IC.Map /> Descargar Mapa
            </button>
            <button onClick={exportCSV} style={{ padding: "9px 20px", borderRadius: 8, border: "none", backgroundColor: C.green, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <IC.Download /> Exportar CSV
            </button>
          </div>
        )}
      </div>

      {/* Controls panel */}
      <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 20, border: "1px solid " + C.border, marginBottom: 16 }}>
        {/* Step 1: Upload */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Paso 1 — Cargar archivo</div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 260px" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Archivo de coordenadas (.csv o .xlsx)</label>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 13, boxSizing: "border-box", backgroundColor: "#FAFBFF" }} />
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>Columnas requeridas: <b>Latitud</b> y <b>Longitud</b>. El resto se conserva.</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, flexShrink: 0 }}>
              <div style={{ marginBottom: 4 }}>Depósito fijo</div>
              <div style={{ fontSize: 12, color: C.textMuted, padding: "9px 12px", borderRadius: 6, border: "1px solid " + C.border, backgroundColor: "#FAFBFF", whiteSpace: "nowrap" }}>★ 19.3989, -99.1168</div>
            </div>
          </div>
          {fileInfo && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, backgroundColor: C.blueBg, color: C.blue, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <IC.Package />
              <span><b>{fileInfo.count.toLocaleString()}</b> líneas con coordenadas válidas detectadas en <b>{fileInfo.name}</b>{guiaKey ? ` · Guía: columna "${guiaKey}"` : ""}</span>
            </div>
          )}
        </div>
        {/* Step 2: Set clusters + generate */}
        {fileInfo && (
          <div style={{ borderTop: "1px solid " + C.border, paddingTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Paso 2 — Configurar y generar rutas</div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Número de rutas (k)</label>
                <input type="number" min="2" value={numClusters} onChange={e => setNumClusters(Math.max(2, parseInt(e.target.value) || 2))} style={{ width: 90, padding: "9px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 16, fontWeight: 700, boxSizing: "border-box", textAlign: "center" }} />
              </div>
              <div style={{ flex: "1 1 240px", minWidth: 200 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Nombre de la sesión (opcional)</label>
                <input type="text" value={sesionNombre} onChange={e => setSesionNombre(e.target.value)} placeholder="ej: Ruteo CDMX Norte - Lunes" maxLength={80} style={{ width: "100%", padding: "9px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <button onClick={generateRoutes} disabled={loading} style={{ padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: C.accent, color: "white", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, whiteSpace: "nowrap" }}>
                🗺️ Generar rutas
              </button>
              {puntos.length > 0 && (
                <button onClick={reCluster} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid " + C.accent, backgroundColor: C.accentLight, color: C.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>↻ Re-clusterizar</button>
              )}
            </div>
          </div>
        )}
        {loading && <div style={{ fontSize: 13, color: C.blue, fontWeight: 600, padding: "10px 0 4px" }}>⏳ Procesando...</div>}
        {msg && <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, padding: "10px 14px", borderRadius: 8, backgroundColor: msg.startsWith("✓") ? C.greenBg : C.redBg, color: msg.startsWith("✓") ? C.green : C.red }}>{msg}</div>}
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
          <div style={{ backgroundColor: C.white, borderRadius: mapMaximized ? 0 : 12, border: "1px solid " + C.border, overflow: "hidden", marginBottom: mapMaximized ? 0 : 14, ...(mapMaximized ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 } : {}) }}>
            {/* Toolbar */}
            <div style={{ padding: "10px 18px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", backgroundColor: C.white }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Mapa interactivo</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button onClick={() => setMapMode("click")} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid " + (mapMode === "click" ? C.accent : C.border), backgroundColor: mapMode === "click" ? C.accentLight : "transparent", color: mapMode === "click" ? C.accent : C.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  👆 Selección individual
                </button>
                <button onClick={() => setMapMode("lasso")} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid " + (mapMode === "lasso" ? "#7C3AED" : C.border), backgroundColor: mapMode === "lasso" ? "#F5F3FF" : "transparent", color: mapMode === "lasso" ? "#7C3AED" : C.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  ✏️ Lasso (área)
                </button>
                {selectedIndices.size > 0 && (
                  <button onClick={() => setSelectedIndices(new Set())} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid " + C.border, backgroundColor: "transparent", color: C.textMuted, fontSize: 11, cursor: "pointer" }}>
                    ✕ Limpiar ({selectedIndices.size})
                  </button>
                )}
                <button onClick={() => setMapMaximized(m => !m)} title={mapMaximized ? "Restaurar mapa" : "Maximizar mapa"} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid " + C.border, backgroundColor: mapMaximized ? C.sidebar : "transparent", color: mapMaximized ? "white" : C.textMuted, fontSize: 16, cursor: "pointer", lineHeight: 1 }}>
                  {mapMaximized ? "⊡" : "⛶"}
                </button>
              </div>
            </div>
            {/* Bulk assignment bar */}
            {selectedIndices.size > 0 && (
              <div style={{ padding: "10px 18px", borderBottom: "1px solid " + C.border, backgroundColor: "#FFFBEB", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#B45309" }}>{selectedIndices.size} punto(s) seleccionado(s)</span>
                <span style={{ fontSize: 12, color: C.textMuted }}>Reasignar a:</span>
                <select value={bulkCluster} onChange={e => setBulkCluster(parseInt(e.target.value))} style={{ padding: "4px 10px", borderRadius: 5, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {Array.from({ length: numClusters }, (_, ci) => <option key={ci} value={ci}>Ruta {ci + 1}</option>)}
                </select>
                <button onClick={applyBulk} style={{ padding: "5px 16px", borderRadius: 6, border: "none", backgroundColor: C.green, color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✓ Aplicar</button>
                <div style={{ width: 1, height: 22, backgroundColor: C.border }} />
                <button onClick={excludeFromRoute} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid #94A3B8", backgroundColor: "#F1F5F9", color: "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer" }} title="Quitar de ruta — estos puntos no saldrán del almacén">✕ Excluir de ruta</button>
                <button onClick={includeInRoute} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid " + C.blue, backgroundColor: C.blueBg, color: C.blue, fontSize: 12, fontWeight: 700, cursor: "pointer" }} title="Reincluir puntos excluidos en la ruta seleccionada">↻ Reincluir</button>
                <span style={{ fontSize: 11, color: C.textMuted, marginLeft: "auto" }}>
                  {mapMode === "lasso" ? "Dibuja una curva sobre el mapa para seleccionar puntos" : "Clic en marcador para seleccionar/deseleccionar · acumulable"}
                </span>
              </div>
            )}
            {/* Map + canvas overlay */}
            <div style={{ position: "relative", height: mapMaximized ? "calc(100vh - 90px)" : 480 }}>
              <div ref={mapDivRef} style={{ height: "100%", width: "100%" }} />
              <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 1000, pointerEvents: mapMode === "lasso" ? "all" : "none", cursor: mapMode === "lasso" ? "crosshair" : "default" }} />
            </div>
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
                    {["#", ...(guiaKey ? ["Guía"] : []), "Latitud", "Longitud", "Cluster / Ruta", ""].map(h => (
                      <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {puntos.map((p, i) => {
                    const cl = asignaciones[i] ?? 0;
                    const isExc = cl === -1;
                    const color = isExc ? "#94A3B8" : RCOLORS[cl % RCOLORS.length];
                    const isSel = selectedIndices.has(i);
                    return (
                      <tr key={i} style={{ borderTop: "1px solid " + C.border, backgroundColor: isSel ? "#FFFBEB" : "transparent" }}
                        onMouseEnter={ev => { if (!isSel) ev.currentTarget.style.backgroundColor = "#FAFBFF"; }}
                        onMouseLeave={ev => { ev.currentTarget.style.backgroundColor = isSel ? "#FFFBEB" : "transparent"; }}>
                        <td style={{ padding: "7px 14px", fontSize: 12, color: C.textMuted }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            {isSel && <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FACC15", display: "inline-block", flexShrink: 0 }} />}
                            {i + 1}
                          </span>
                        </td>
                        {guiaKey && (
                          <td style={{ padding: "7px 14px", fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: C.text, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p[guiaKey] || "—"}
                          </td>
                        )}
                        <td style={{ padding: "7px 14px", fontSize: 12 }}>{p.lat.toFixed(6)}</td>
                        <td style={{ padding: "7px 14px", fontSize: 12 }}>{p.lng.toFixed(6)}</td>
                        <td style={{ padding: "7px 14px" }}>
                          <select value={cl} onChange={e => {
                            const nc = parseInt(e.target.value);
                            setAsignaciones(prev => { const n = [...prev]; n[i] = nc; return n; });
                            if (sesionId) supabase.from("ruteo_puntos").update({ cluster: nc, ruta: nc === -1 ? "Excluido" : "Ruta " + (nc + 1) }).eq("sesion", sesionId).eq("indice", i);
                          }} style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid " + C.border, fontSize: 12, fontWeight: 600, color, cursor: "pointer", backgroundColor: color + "12" }}>
                            <option value={-1}>✕ Excluido</option>
                            {Array.from({ length: numClusters }, (_, ci) => <option key={ci} value={ci}>Ruta {ci + 1}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "7px 14px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 4, backgroundColor: color + "18", color }}>{isExc ? "Excluido" : "Ruta " + (cl + 1)}</span>
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

      {puntos.length === 0 && !loading && !fileInfo && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 48, border: "1px solid " + C.border, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>Carga un archivo para comenzar</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>CSV o Excel con columnas <b>Latitud</b> y <b>Longitud</b>. Después de cargar el archivo, define el número de rutas y haz clic en <b>Generar rutas</b>.</div>
        </div>
      )}

      {/* Histórico de sesiones */}
      <div style={{ backgroundColor: C.white, borderRadius: 12, border: "1px solid " + C.border, overflow: "hidden", marginTop: 20 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Histórico de ruteos</div>
          <button onClick={() => { setShowHistorico(!showHistorico); if (!showHistorico && historico.length === 0) loadHistorico(); }}
            style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid " + (showHistorico ? C.textMuted : C.accent), backgroundColor: showHistorico ? C.bg : C.accentLight, color: showHistorico ? C.textMuted : C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {showHistorico ? "Ocultar" : "Ver sesiones anteriores"}
          </button>
        </div>
        {showHistorico && (
          loadingHist ? (
            <div style={{ padding: 30, textAlign: "center", color: C.textMuted, fontSize: 13 }}>Cargando sesiones...</div>
          ) : historico.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: C.textMuted, fontSize: 13 }}>Sin sesiones guardadas</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid " + C.border }}>
                  {["Sesión", "Nombre", "Fecha", "Puntos", "Rutas", "Acciones"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historico.map((h) => (
                  <tr key={h.sesion} style={{ borderBottom: "1px solid " + C.border }}
                    onMouseEnter={ev => ev.currentTarget.style.backgroundColor = "#FAFBFF"}
                    onMouseLeave={ev => ev.currentTarget.style.backgroundColor = "transparent"}>
                    <td style={{ padding: "12px 14px", fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: C.accent }}>{h.sesion.substring(0, 14)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: h.nombre ? C.text : C.textMuted, fontStyle: h.nombre ? "normal" : "italic" }}>{h.nombre || "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: C.textMuted }}>{new Date(h.fecha).toLocaleString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>{h.puntos}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 4, backgroundColor: C.blueBg, color: C.blue }}>{h.rutas} rutas</span>
                    </td>
                    <td style={{ padding: "12px 14px", display: "flex", gap: 6 }}>
                      <button onClick={() => loadSesion(h.sesion)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid " + C.accent, backgroundColor: C.accentLight, color: C.accent, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <IC.MapPin /> Cargar
                      </button>
                      <button onClick={() => exportHistMapHTML(h.sesion)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid " + C.blue, backgroundColor: C.blueBg, color: C.blue, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <IC.Map /> Mapa HTML
                      </button>
                      <button onClick={() => deleteHistSesion(h.sesion)} style={{ padding: "5px 8px", borderRadius: 6, border: "none", backgroundColor: C.redBg, cursor: "pointer", color: C.red }}><IC.Trash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}

// --- ASIGNACIONES ---
function ModuleAsignaciones() {
  const [carriers, setCarriers] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sesionId, setSesionId] = useState(null);
  const [rutas, setRutas] = useState([]);
  const [loadingSession, setLoadingSession] = useState(false);
  const [asignacion, setAsignacion] = useState({});
  const [expandedRuta, setExpandedRuta] = useState(null);
  const [sortBy, setSortBy] = useState(null); // "paquetes" | "costoDia" | "costoPaq"
  const [sortDir, setSortDir] = useState("desc"); // "desc" | "asc"
  const [confirmModal, setConfirmModal] = useState(null);
  const [deletingSesion, setDeletingSesion] = useState(false);
  const [sesionDropdownOpen, setSesionDropdownOpen] = useState(false);
  const sesionDropdownRef = useRef(null);
  const sesionListRef = useRef(null);
  const [capacidad, setCapacidad] = useState(() => {
    try { return JSON.parse(localStorage.getItem("t1_capacidad_v1") || "{}"); } catch { return {}; }
  });
  const [capacidadOpen, setCapacidadOpen] = useState(false);
  const persistCapacidad = (next) => {
    setCapacidad(next);
    try { localStorage.setItem("t1_capacidad_v1", JSON.stringify(next)); } catch {}
  };

  // Close on outside click
  useEffect(() => {
    if (!sesionDropdownOpen) return;
    const onClick = (e) => {
      if (sesionDropdownRef.current && !sesionDropdownRef.current.contains(e.target)) setSesionDropdownOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [sesionDropdownOpen]);

  // When opened, scroll to bottom (most recent session is the last item)
  useEffect(() => {
    if (!sesionDropdownOpen) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = sesionListRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
    const t = setTimeout(() => {
      const el = sesionListRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      clearTimeout(t);
    };
  }, [sesionDropdownOpen, historico.length]);

  const COSTO_IDEAL = 40;
  const COSTO_MAX = 45;

  const eliminarSesion = (sid) => {
    const sel = historico.find(h => h.sesion === sid);
    if (!sel) return;
    const dateStr = new Date(sel.fecha).toLocaleString("es-MX", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
    setConfirmModal({
      message: `¿Eliminar sesión ${sid.substring(0,10)} (${dateStr}, ${sel.puntos} puntos, ${sel.rutas} rutas)? Se borran sus puntos y asignaciones de Supabase. No se puede deshacer.`,
      onConfirm: async () => {
        setDeletingSesion(true);
        try {
          const [{ error: e1 }, { error: e2 }] = await Promise.all([
            supabase.from("ruteo_puntos").delete().eq("sesion", sid),
            supabase.from("asignaciones_sesion").delete().eq("sesion", sid).then(r => r).catch(e => ({ error: e })),
          ]);
          if (e1) throw e1;
          setHistorico(prev => prev.filter(h => h.sesion !== sid));
          if (sesionId === sid) { setSesionId(null); setRutas([]); setAsignacion({}); }
        } catch (err) {
          alert("Error al eliminar sesión: " + (err?.message || err));
        }
        setDeletingSesion(false);
      },
    });
  };

  useEffect(() => { loadData(); }, []);

  // Paginated fetch to bypass Supabase's default 1000-row cap
  const fetchAllPaginated = async (queryBuilder) => {
    let all = [];
    const pageSize = 1000;
    let from = 0;
    while (true) {
      const { data: chunk, error } = await queryBuilder().range(from, from + pageSize - 1);
      if (error) { console.error("Pagination error:", error); break; }
      if (!chunk || chunk.length === 0) break;
      all = all.concat(chunk);
      if (chunk.length < pageSize) break;
      from += pageSize;
    }
    return all;
  };

  // Carga ruteo_puntos resiliente: intenta con la columna `nombre` y si la BD
  // no la tiene aún (no se corrió el ALTER TABLE), cae al select sin `nombre`.
  // Paginación por keyset sobre `id` (PK único, monotónico) en lugar de offset:
  // con ORDER BY created_at + offset, las filas que comparten created_at (todos
  // los puntos de una sesión se insertan al mismo instante) pueden saltarse o
  // duplicarse, haciendo que la última sesión no aparezca.
  const fetchPuntosResumen = async () => {
    const probe = await supabase.from("ruteo_puntos").select("sesion, created_at, cluster, nombre").limit(1);
    const tieneNombre = !probe.error;
    const baseCols = tieneNombre ? "id, sesion, created_at, cluster, nombre" : "id, sesion, created_at, cluster";
    const byId = new Map();
    const pageSize = 1000;
    let cursor = null;
    while (true) {
      let q = supabase.from("ruteo_puntos").select(baseCols).order("id", { ascending: false }).limit(pageSize);
      if (cursor !== null) q = q.lt("id", cursor);
      const { data: chunk, error } = await q;
      if (error) { console.error("ruteo_puntos load error:", error); break; }
      if (!chunk || chunk.length === 0) break;
      for (const row of chunk) byId.set(row.id, row);
      if (chunk.length < pageSize) break;
      cursor = chunk[chunk.length - 1].id;
    }
    return Array.from(byId.values());
  };

  const loadData = async () => {
    setLoading(true);
    const [{ data: cData }, rData] = await Promise.all([
      supabase.from("carriers").select("*").order("proveedor"),
      fetchPuntosResumen(),
    ]);
    const umCarriers = (cData || []).filter(c => c.tipo_unidad && c.tipo_unidad !== "---" && c.tipo_unidad !== "—" && (c.operacion || "").toLowerCase().includes("ltima"));
    setCarriers(umCarriers);
    if (rData && rData.length > 0) {
      const grouped = {};
      rData.forEach(r => {
        if (!grouped[r.sesion]) grouped[r.sesion] = { sesion: r.sesion, fecha: r.created_at, nombre: r.nombre || null, puntos: 0, rutas: new Set() };
        grouped[r.sesion].puntos += 1;
        grouped[r.sesion].rutas.add(r.cluster);
        if (!grouped[r.sesion].nombre && r.nombre) grouped[r.sesion].nombre = r.nombre;
      });
      const sorted = Object.values(grouped).map(g => ({ ...g, rutas: g.rutas.size })).sort((a, b) => b.fecha.localeCompare(a.fecha));
      setHistorico(sorted);
      // Auto-carga la sesión más reciente para que aparezca pre-seleccionada en azul
      if (sorted.length > 0 && !sesionId) {
        loadSesion(sorted[0].sesion);
      }
    }
    setLoading(false);
  };

  const [saveMsg, setSaveMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const loadSesion = async (sid) => {
    setLoadingSession(true);
    setSesionId(sid);
    const [data, savedRows] = await Promise.all([
      fetchAllPaginated(() => supabase.from("ruteo_puntos").select("*").eq("sesion", sid).order("indice")),
      supabase.from("asignaciones_sesion").select("*").eq("sesion", sid).then(r => r.data || []).catch(() => []),
    ]);
    console.log(`[Asignaciones] Sesión ${sid}: ${data.length} puntos cargados de Supabase`);
    if (data && data.length > 0) {
      const rutaMap = {};
      let excluidos = 0;
      data.forEach(r => {
        if (r.cluster === -1) { excluidos++; return; } // skip excluded points
        const rn = r.ruta || "Ruta " + (r.cluster + 1);
        if (!rutaMap[rn]) rutaMap[rn] = { nombre: rn, cluster: r.cluster, paquetes: 0 };
        rutaMap[rn].paquetes += 1;
      });
      console.log(`[Asignaciones] Excluidos: ${excluidos} · En rutas: ${data.length - excluidos}`);
      const rutaList = Object.values(rutaMap).sort((a, b) => a.cluster - b.cluster);
      setRutas(rutaList);

      // Build saved-assignment map keyed by ruta_nombre
      const savedMap = {};
      (savedRows || []).forEach(s => {
        savedMap[s.ruta_nombre] = s.no_asignar
          ? { noAsignar: true }
          : { proveedor: s.proveedor, tipo_unidad: s.tipo_unidad, unidades: s.unidades || 1 };
      });

      const finalAsign = {};
      rutaList.forEach(ruta => {
        if (savedMap[ruta.nombre]) {
          finalAsign[ruta.nombre] = savedMap[ruta.nombre];
        } else {
          // Auto-assign best recommendation if no saved value
          const opciones = carriers.map(c => {
            const costo = parseFloat(c.costo_unidad) || 0;
            const minP = Math.ceil(costo / COSTO_MAX);
            const viable = ruta.paquetes >= minP;
            const costoPorPaq = ruta.paquetes > 0 ? costo / ruta.paquetes : Infinity;
            return { proveedor: c.proveedor, tipo_unidad: c.tipo_unidad, costo, viable, costoPorPaq };
          }).filter(o => o.viable);
          opciones.sort((a, b) => a.costoPorPaq - b.costoPorPaq);
          if (opciones[0]) {
            finalAsign[ruta.nombre] = { proveedor: opciones[0].proveedor, tipo_unidad: opciones[0].tipo_unidad, unidades: 1 };
          }
        }
      });
      setAsignacion(finalAsign);
      if (savedRows && savedRows.length > 0) {
        setSaveMsg(`✓ Asignación previa cargada (${savedRows.length} rutas guardadas)`);
        setTimeout(() => setSaveMsg(""), 4000);
      }
    } else {
      setRutas([]);
      setAsignacion({});
    }
    setExpandedRuta(null);
    setLoadingSession(false);
  };

  const guardarAsignacion = async () => {
    if (!sesionId || rutas.length === 0) return;
    setSaving(true);
    setSaveMsg("");
    try {
      // Wipe previous saved assignments for this session
      await supabase.from("asignaciones_sesion").delete().eq("sesion", sesionId);
      // Build rows
      const rows = rutas.map(ruta => {
        const a = asignacion[ruta.nombre];
        if (!a) return null;
        if (a.noAsignar) return { sesion: sesionId, ruta_nombre: ruta.nombre, proveedor: null, tipo_unidad: null, unidades: null, no_asignar: true };
        return { sesion: sesionId, ruta_nombre: ruta.nombre, proveedor: a.proveedor, tipo_unidad: a.tipo_unidad, unidades: a.unidades || 1, no_asignar: false };
      }).filter(Boolean);
      if (rows.length > 0) {
        const { error } = await supabase.from("asignaciones_sesion").insert(rows);
        if (error) throw error;
      }
      setSaveMsg(`✓ Asignación guardada (${rows.length} rutas)`);
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (err) {
      const msg = err?.message || String(err);
      if (/relation .* does not exist/i.test(msg) || /does not exist/i.test(msg)) {
        setSaveMsg("⚠ Falta crear la tabla 'asignaciones_sesion' en Supabase. Ver consola para SQL.");
        console.warn("Ejecuta este SQL en Supabase:\n\nCREATE TABLE asignaciones_sesion (\n  id bigserial PRIMARY KEY,\n  sesion text NOT NULL,\n  ruta_nombre text NOT NULL,\n  proveedor text,\n  tipo_unidad text,\n  unidades int,\n  no_asignar boolean DEFAULT false,\n  created_at timestamptz DEFAULT now(),\n  UNIQUE (sesion, ruta_nombre)\n);\nCREATE INDEX idx_asignaciones_sesion ON asignaciones_sesion(sesion);");
      } else {
        setSaveMsg("Error: " + msg);
      }
    }
    setSaving(false);
  };

  const minPaq = costo => Math.ceil(costo / COSTO_MAX);
  const idealPaq = costo => Math.ceil(costo / COSTO_IDEAL);

  const getRecomendacion = (paquetes) => {
    const opciones = carriers.map(c => {
      const costo = parseFloat(c.costo_unidad) || 0;
      const minP = minPaq(costo);
      const idealP = idealPaq(costo);
      const costoPorPaq = paquetes > 0 ? costo / paquetes : Infinity;
      const viable = paquetes >= minP;
      const ideal = paquetes >= idealP;
      return { proveedor: c.proveedor, tipo_unidad: c.tipo_unidad, costo, minP, idealP, costoPorPaq, viable, ideal };
    }).filter(o => o.viable);
    opciones.sort((a, b) => a.costoPorPaq - b.costoPorPaq);
    return opciones;
  };

  const tipoColors = { Moto:{bg:"#FEF3C7",c:"#D97706"}, Sedan:{bg:"#DBEAFE",c:"#2563EB"}, SmallVan:{bg:"#EDE9FE",c:"#7C3AED"}, Van:{bg:"#EDE9FE",c:"#7C3AED"}, "1.5":{bg:"#FEF9C3",c:"#CA8A04"}, "3.5":{bg:"#FFEDD5",c:"#C2410C"}, Rabon:{bg:"#FFEDD5",c:"#EA580C"}, Torton:{bg:"#FEE2E2",c:"#DC2626"}, Tracto:{bg:"#F1F5F9",c:"#475569"} };

  // Auto-asignación respetando capacidad disponible.
  // Estrategia: rutas más pequeñas primero — así reciben los proveedores más baratos
  // (en rutas chicas su costo/paq pega más). Las rutas grandes pueden absorber
  // proveedores más caros porque diluyen el costo por paquete.
  const sugerirAsignacion = () => {
    if (!rutas.length || !carriers.length) return;
    const cap = { ...capacidad };
    const sorted = [...rutas].sort((a, b) => a.paquetes - b.paquetes);
    const next = {};
    for (const ruta of sorted) {
      const opciones = carriers.map(c => {
        const costo = parseFloat(c.costo_unidad) || 0;
        const minP = Math.ceil(costo / COSTO_MAX);
        const key = c.proveedor + "|" + c.tipo_unidad;
        const restante = Number(cap[key] || 0);
        return { proveedor: c.proveedor, tipo_unidad: c.tipo_unidad, costo, key, viable: ruta.paquetes >= minP, disponible: restante > 0 };
      }).filter(o => o.viable && o.disponible).sort((a, b) => a.costo - b.costo);
      if (opciones.length > 0) {
        const sel = opciones[0];
        next[ruta.nombre] = { proveedor: sel.proveedor, tipo_unidad: sel.tipo_unidad, unidades: 1 };
        cap[sel.key] = Number(cap[sel.key] || 0) - 1;
      } else {
        next[ruta.nombre] = { noAsignar: true };
      }
    }
    setAsignacion(next);
    setSaveMsg("✓ Sugerencia generada respetando capacidad. Revisa y edita lo que necesites.");
    setTimeout(() => setSaveMsg(""), 5000);
  };

  // Capacidad usada actualmente por la asignación vigente
  const capacidadUsada = (() => {
    const usada = {};
    rutas.forEach(r => {
      const a = asignacion[r.nombre];
      if (!a || a.noAsignar) return;
      const key = a.proveedor + "|" + a.tipo_unidad;
      usada[key] = (usada[key] || 0) + (a.unidades || 1);
    });
    return usada;
  })();

  const exportarPDF = () => {
    if (!sesionId || rutas.length === 0) return;
    const fechaStr = new Date().toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" });
    const totalPaq = rutas.reduce((s, r) => s + r.paquetes, 0);
    const filas = rutas.map(r => {
      const a = asignacion[r.nombre];
      if (!a) return { ruta: r.nombre, paquetes: r.paquetes, proveedor: "—", tipo: "—", unidades: "—", costo: "—", costoPaq: "—", estado: "Sin asignar" };
      if (a.noAsignar) return { ruta: r.nombre, paquetes: r.paquetes, proveedor: "NO ASIGNAR", tipo: "—", unidades: "—", costo: "$0", costoPaq: "—", estado: "No sale" };
      const car = carriers.find(c => c.proveedor === a.proveedor && c.tipo_unidad === a.tipo_unidad);
      const cu = parseFloat(car?.costo_unidad) || 0;
      const ct = cu * (a.unidades || 1);
      const cpq = r.paquetes > 0 ? ct / r.paquetes : 0;
      return {
        ruta: r.nombre, paquetes: r.paquetes, proveedor: a.proveedor, tipo: a.tipo_unidad,
        unidades: a.unidades || 1, costo: "$" + ct.toLocaleString(),
        costoPaq: "$" + cpq.toFixed(1),
        estado: cpq <= COSTO_IDEAL ? "Ideal" : cpq <= COSTO_MAX ? "Viable" : "Excede"
      };
    });
    const totalCosto = rutas.reduce((s, r) => {
      const a = asignacion[r.nombre]; if (!a || a.noAsignar) return s;
      const car = carriers.find(c => c.proveedor === a.proveedor && c.tipo_unidad === a.tipo_unidad);
      return s + ((parseFloat(car?.costo_unidad) || 0) * (a.unidades || 1));
    }, 0);
    const paqAsig = rutas.filter(r => { const a = asignacion[r.nombre]; return a && !a.noAsignar; }).reduce((s, r) => s + r.paquetes, 0);

    // Resumen por proveedor
    const resProv = {};
    rutas.forEach(r => {
      const a = asignacion[r.nombre]; if (!a || a.noAsignar) return;
      const k = a.proveedor + "|" + a.tipo_unidad;
      if (!resProv[k]) resProv[k] = { proveedor: a.proveedor, tipo: a.tipo_unidad, rutas: 0, unidades: 0, paquetes: 0, costo: 0 };
      const car = carriers.find(c => c.proveedor === a.proveedor && c.tipo_unidad === a.tipo_unidad);
      resProv[k].rutas++; resProv[k].unidades += a.unidades || 1; resProv[k].paquetes += r.paquetes;
      resProv[k].costo += (parseFloat(car?.costo_unidad) || 0) * (a.unidades || 1);
    });
    const provList = Object.values(resProv).sort((a, b) => b.costo - a.costo);

    const colorEstado = e => e === "Ideal" ? "#16A34A" : e === "Viable" ? "#CA8A04" : e === "No sale" ? "#7C8495" : e === "Excede" ? "#DC2626" : "#7C8495";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Asignaciones ${sesionId.substring(0,10)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',-apple-system,sans-serif;color:#1F2937;padding:14mm 12mm;font-size:10pt}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #FF4500;padding-bottom:10px;margin-bottom:14px}
  .title{font-size:20pt;font-weight:800;color:#1F2937}
  .subtitle{font-size:9pt;color:#7C8495;margin-top:3px}
  .meta{font-size:8.5pt;color:#7C8495;text-align:right;line-height:1.5}
  .meta b{color:#1F2937}
  .stats{display:flex;gap:8px;margin-bottom:14px}
  .stat{flex:1;border:1px solid #E5E7EB;border-radius:6px;padding:8px 10px}
  .stat-label{font-size:7.5pt;font-weight:700;color:#7C8495;text-transform:uppercase;letter-spacing:0.05em}
  .stat-value{font-size:14pt;font-weight:800;color:#1F2937;margin-top:2px}
  h2{font-size:11pt;font-weight:700;margin:14px 0 6px;color:#1F2937}
  table{width:100%;border-collapse:collapse;font-size:8.5pt}
  th{background:#F3F4F6;padding:6px 8px;text-align:left;font-size:7.5pt;font-weight:700;color:#7C8495;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid #E5E7EB}
  td{padding:6px 8px;border-bottom:1px solid #F1F5F9}
  .badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:7.5pt;font-weight:700;color:#FFF}
  .right{text-align:right}
  .total-row{background:#FAFBFF;font-weight:800}
  .total-row td{border-top:2px solid #1F2937;font-size:9pt}
  .footer{margin-top:18px;padding-top:8px;border-top:1px solid #E5E7EB;font-size:7.5pt;color:#7C8495;text-align:center}
</style></head><body>
  <div class="header">
    <div>
      <div class="title">Asignación de Rutas</div>
      <div class="subtitle">Última milla · Target $${COSTO_IDEAL} ideal / $${COSTO_MAX} máx por paquete</div>
    </div>
    <div class="meta">
      <div><b>Sesión:</b> ${sesionId}</div>
      <div><b>Generado:</b> ${fechaStr}</div>
      <div><b>Total rutas:</b> ${rutas.length} · <b>Paquetes:</b> ${totalPaq}</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-label">Rutas asignadas</div><div class="stat-value">${rutas.filter(r=>{const a=asignacion[r.nombre];return a&&!a.noAsignar;}).length} / ${rutas.length}</div></div>
    <div class="stat"><div class="stat-label">Paquetes asignados</div><div class="stat-value">${paqAsig} / ${totalPaq}</div></div>
    <div class="stat"><div class="stat-label">Costo total</div><div class="stat-value" style="color:#16A34A">$${totalCosto.toLocaleString()}</div></div>
    <div class="stat"><div class="stat-label">Costo / paquete</div><div class="stat-value">${paqAsig>0?"$"+(totalCosto/paqAsig).toFixed(1):"—"}</div></div>
  </div>

  <h2>Detalle por ruta</h2>
  <table>
    <thead><tr><th>Ruta</th><th class="right">Paquetes</th><th>Proveedor</th><th>Tipo unidad</th><th class="right">Unidades</th><th class="right">Costo</th><th class="right">$/Paq</th><th>Estado</th></tr></thead>
    <tbody>
      ${filas.map(f => `<tr>
        <td><b>${f.ruta}</b></td>
        <td class="right">${f.paquetes}</td>
        <td>${f.proveedor}</td>
        <td>${f.tipo}</td>
        <td class="right">${f.unidades}</td>
        <td class="right">${f.costo}</td>
        <td class="right"><b>${f.costoPaq}</b></td>
        <td><span class="badge" style="background:${colorEstado(f.estado)}">${f.estado}</span></td>
      </tr>`).join("")}
      <tr class="total-row"><td>TOTAL</td><td class="right">${totalPaq}</td><td colspan="3">${rutas.length} rutas</td><td class="right">$${totalCosto.toLocaleString()}</td><td class="right">${paqAsig>0?"$"+(totalCosto/paqAsig).toFixed(1):"—"}</td><td></td></tr>
    </tbody>
  </table>

  ${provList.length > 0 ? `
  <h2>Resumen por proveedor</h2>
  <table>
    <thead><tr><th>Proveedor</th><th>Tipo</th><th class="right">Rutas</th><th class="right">Unidades</th><th class="right">Paquetes</th><th class="right">Costo total</th><th class="right">$/Paq</th></tr></thead>
    <tbody>
      ${provList.map(p => `<tr>
        <td><b>${p.proveedor}</b></td>
        <td>${p.tipo}</td>
        <td class="right">${p.rutas}</td>
        <td class="right">${p.unidades}</td>
        <td class="right">${p.paquetes}</td>
        <td class="right">$${p.costo.toLocaleString()}</td>
        <td class="right"><b>$${(p.costo/p.paquetes).toFixed(1)}</b></td>
      </tr>`).join("")}
      <tr class="total-row"><td colspan="2">TOTAL</td><td class="right">${provList.reduce((s,p)=>s+p.rutas,0)}</td><td class="right">${provList.reduce((s,p)=>s+p.unidades,0)}</td><td class="right">${paqAsig}</td><td class="right">$${totalCosto.toLocaleString()}</td><td class="right">${paqAsig>0?"$"+(totalCosto/paqAsig).toFixed(1):"—"}</td></tr>
    </tbody>
  </table>` : ""}

  <div class="footer">T1 OPS Envíos · Flotilla Propia · Asignación generada automáticamente</div>
</body></html>`;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) { alert("Permite ventanas emergentes para descargar el PDF"); return; }
    w.document.write(html);
    w.document.close();
    const script = w.document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js";
    script.onload = () => {
      setTimeout(() => {
        w.html2pdf().set({
          margin: [10, 10, 10, 10],
          filename: `Asignacion_${sesionId.substring(0,10)}_${new Date().toISOString().split("T")[0]}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "letter", orientation: "landscape" },
        }).from(w.document.body).save().then(() => { setTimeout(() => w.close(), 500); });
      }, 600);
    };
    w.document.head.appendChild(script);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, margin:0 }}>Asignaciones</h1>
          <p style={{ color:C.textMuted, fontSize:13, marginTop:2 }}>Recomendación de asignación por costo · Última milla · Target: ${COSTO_IDEAL} ideal / ${COSTO_MAX} máx por paquete</p>
        </div>
        {sesionId && rutas.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            {saveMsg && <span style={{ fontSize:12, fontWeight:600, color:saveMsg.startsWith("✓")?C.green:saveMsg.startsWith("⚠")?"#CA8A04":C.red }}>{saveMsg}</span>}
            <button onClick={guardarAsignacion} disabled={saving} style={{ padding:"9px 18px", borderRadius:8, border:"none", backgroundColor:saving?C.textMuted:C.green, color:"white", fontSize:13, fontWeight:700, cursor:saving?"default":"pointer", display:"flex", alignItems:"center", gap:6 }}>
              {saving ? "Guardando..." : "✓ Guardar asignación"}
            </button>
            <button onClick={exportarPDF} style={{ padding:"9px 18px", borderRadius:8, border:"none", backgroundColor:C.accent, color:"white", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <IC.Download /> Exportar PDF
            </button>
          </div>
        )}
      </div>

      {loading ? <div style={{ padding:40, textAlign:"center", color:C.textMuted }}>Cargando...</div> : (
        <>
          {/* Tabla pivot de costos por carrier */}
          {(() => {
            const provs = [...new Set(carriers.map(c => c.proveedor))].sort();
            const tipos = [...new Set(carriers.map(c => c.tipo_unidad))];
            const tipoOrder = ["Moto","Sedan","SmallVan","Van","1.5","3.5","Rabon","Torton","Tracto"];
            tipos.sort((a, b) => (tipoOrder.indexOf(a) === -1 ? 99 : tipoOrder.indexOf(a)) - (tipoOrder.indexOf(b) === -1 ? 99 : tipoOrder.indexOf(b)));
            const getCost = (prov, tipo) => { const c = carriers.find(x => x.proveedor === prov && x.tipo_unidad === tipo); return c ? parseFloat(c.costo_unidad) || 0 : null; };
            return (
              <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, overflow:"hidden", marginBottom:20 }}>
                <div style={{ padding:"13px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Catálogo de carriers — Última milla</div>
                  <div style={{ display:"flex", gap:12, fontSize:11, color:C.textMuted }}>
                    <span>Costo/día por unidad</span>
                    <span style={{ color:C.textMuted }}>·</span>
                    <span style={{ color:C.blue, fontWeight:600 }}>Min. paq (${ COSTO_MAX})</span>
                  </div>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor:C.bg }}>
                        <th style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", position:"sticky", left:0, backgroundColor:C.bg, zIndex:1 }}>Proveedor</th>
                        {tipos.map(t => {
                          const tc = tipoColors[t] || {bg:"#F3F4F6",c:"#7C8495"};
                          return <th key={t} style={{ padding:"10px 14px", textAlign:"center", fontSize:10, fontWeight:700, minWidth:90 }}>
                            <span style={{ padding:"3px 10px", borderRadius:5, backgroundColor:tc.bg, color:tc.c, fontWeight:700 }}>{t}</span>
                          </th>;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {provs.map((prov, pi) => (
                        <tr key={prov} style={{ borderTop:"1px solid "+C.border }}
                          onMouseEnter={ev=>ev.currentTarget.style.backgroundColor="#FAFBFF"}
                          onMouseLeave={ev=>ev.currentTarget.style.backgroundColor="transparent"}>
                          <td style={{ padding:"12px 16px", fontSize:13, fontWeight:700, color:C.text, whiteSpace:"nowrap", position:"sticky", left:0, backgroundColor:"inherit", zIndex:1 }}>{prov}</td>
                          {tipos.map(t => {
                            const cost = getCost(prov, t);
                            if (cost === null) return <td key={t} style={{ padding:"10px 14px", textAlign:"center", color:C.border, fontSize:12 }}>—</td>;
                            return (
                              <td key={t} style={{ padding:"8px 10px", textAlign:"center" }}>
                                <div style={{ fontSize:14, fontWeight:800, color:C.green }}>${cost.toLocaleString()}</div>
                                <div style={{ fontSize:10, color:C.blue, fontWeight:600, marginTop:2 }}>{minPaq(cost)} paq</div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {carriers.length === 0 && <div style={{ padding:32, textAlign:"center", color:C.textMuted, fontSize:13 }}>No hay carriers con operación "Última milla" configurados.</div>}
              </div>
            );
          })()}

          {/* Capacidad disponible por proveedor */}
          {carriers.length > 0 && (() => {
            const provs = [...new Set(carriers.map(c => c.proveedor))].sort();
            const tipos = [...new Set(carriers.map(c => c.tipo_unidad))];
            const tipoOrder = ["Moto","Sedan","SmallVan","Van","1.5","3.5","Rabon","Torton","Tracto"];
            tipos.sort((a, b) => (tipoOrder.indexOf(a) === -1 ? 99 : tipoOrder.indexOf(a)) - (tipoOrder.indexOf(b) === -1 ? 99 : tipoOrder.indexOf(b)));
            const has = (p, t) => carriers.some(x => x.proveedor === p && x.tipo_unidad === t);
            const totalDisp = Object.values(capacidad).reduce((s, v) => s + (Number(v) || 0), 0);
            const totalUsada = Object.values(capacidadUsada).reduce((s, v) => s + v, 0);
            return (
              <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, overflow:"hidden", marginBottom:20 }}>
                <div style={{ padding:"13px 18px", borderBottom: capacidadOpen ? "1px solid "+C.border : "none", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <button onClick={() => setCapacidadOpen(o => !o)} type="button" style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontSize:13, fontWeight:700, color:C.text, display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ display:"inline-block", transform:capacidadOpen?"rotate(90deg)":"none", transition:"transform 0.15s", color:C.textMuted }}>▶</span>
                      Capacidad disponible por proveedor
                    </button>
                    <span style={{ fontSize:11, color:C.textMuted }}>
                      Total disponible: <b style={{ color:C.text }}>{totalDisp}</b>
                      {rutas.length > 0 && <> · usadas: <b style={{ color:totalUsada>totalDisp?C.red:C.green }}>{totalUsada}</b></>}
                    </span>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {sesionId && rutas.length > 0 && (
                      <button onClick={sugerirAsignacion} disabled={totalDisp === 0}
                        title={totalDisp === 0 ? "Define al menos una unidad disponible" : "Asigna automáticamente las rutas a los proveedores más baratos respetando la capacidad"}
                        style={{ padding:"7px 14px", borderRadius:8, border:"1px solid "+C.accent, backgroundColor:totalDisp===0?C.bg:C.accent, color:totalDisp===0?C.textMuted:"white", fontSize:12, fontWeight:700, cursor:totalDisp===0?"not-allowed":"pointer" }}>
                        ⚡ Sugerir asignación óptima
                      </button>
                    )}
                    <button onClick={() => persistCapacidad({})} disabled={totalDisp === 0}
                      style={{ padding:"7px 12px", borderRadius:8, border:"1px solid "+C.border, backgroundColor:C.white, color:totalDisp===0?C.textMuted:C.text, fontSize:11, fontWeight:600, cursor:totalDisp===0?"not-allowed":"pointer" }}>
                      Limpiar
                    </button>
                  </div>
                </div>
                {capacidadOpen && (
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor:C.bg }}>
                          <th style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", position:"sticky", left:0, backgroundColor:C.bg, zIndex:1 }}>Proveedor</th>
                          {tipos.map(t => {
                            const tc = tipoColors[t] || {bg:"#F3F4F6",c:"#7C8495"};
                            return <th key={t} style={{ padding:"10px 14px", textAlign:"center", fontSize:10, fontWeight:700, minWidth:100 }}>
                              <span style={{ padding:"3px 10px", borderRadius:5, backgroundColor:tc.bg, color:tc.c, fontWeight:700 }}>{t}</span>
                            </th>;
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {provs.map(prov => (
                          <tr key={prov} style={{ borderTop:"1px solid "+C.border }}>
                            <td style={{ padding:"10px 16px", fontSize:13, fontWeight:700, color:C.text, whiteSpace:"nowrap", position:"sticky", left:0, backgroundColor:C.white, zIndex:1 }}>{prov}</td>
                            {tipos.map(t => {
                              if (!has(prov, t)) return <td key={t} style={{ padding:"8px 10px", textAlign:"center", color:C.border, fontSize:12 }}>—</td>;
                              const key = prov + "|" + t;
                              const val = capacidad[key] || "";
                              const usada = capacidadUsada[key] || 0;
                              const disp = Number(val) || 0;
                              const exceso = usada > disp && disp > 0;
                              return (
                                <td key={t} style={{ padding:"6px 8px", textAlign:"center" }}>
                                  <input type="number" min="0" value={val}
                                    onChange={e => {
                                      const v = e.target.value;
                                      const next = { ...capacidad };
                                      if (v === "" || v === "0") delete next[key]; else next[key] = parseInt(v, 10) || 0;
                                      persistCapacidad(next);
                                    }}
                                    style={{ width:64, padding:"6px 4px", borderRadius:6, border:"1px solid "+(exceso?C.red:disp>0?C.accent:C.border), fontSize:14, fontWeight:700, textAlign:"center", boxSizing:"border-box", backgroundColor:disp>0?C.accentLight:C.white, color:disp>0?C.accent:C.textMuted }} />
                                  {rutas.length > 0 && disp > 0 && (
                                    <div style={{ fontSize:9, marginTop:3, color:exceso?C.red:usada===disp?C.green:C.textMuted, fontWeight:700 }}>
                                      uso {usada}/{disp}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Selector de sesión de ruteo */}
          <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, marginBottom:20, position:"relative", zIndex:20 }}>
            <div style={{ padding:"13px 18px", borderBottom:"1px solid "+C.border, fontSize:13, fontWeight:700, color:C.text }}>Seleccionar sesión de ruteo</div>
            {historico.length === 0 ? (
              <div style={{ padding:32, textAlign:"center", color:C.textMuted, fontSize:13 }}>No hay sesiones de ruteo guardadas. Crea una en el módulo Ruteo/Clusters.</div>
            ) : (
              <div style={{ padding:16, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Sesión:</label>
                {/* Custom dropdown — native <select> can't scroll to bottom on open */}
                <div ref={sesionDropdownRef} style={{ position:"relative", flex:"1 1 420px", maxWidth:600 }}>
                  <button onClick={() => setSesionDropdownOpen(o => !o)} type="button"
                    style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid "+(sesionId?C.accent:C.border), fontSize:13, fontWeight:600, color:C.text, cursor:"pointer", backgroundColor:sesionId?C.accentLight:C.white, textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
                    <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {sesionId ? (() => {
                        const sel = historico.find(h => h.sesion === sesionId);
                        if (!sel) return sesionId;
                        const dateStr = new Date(sel.fecha).toLocaleString("es-MX", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
                        const prefix = sel.nombre ? `${sel.nombre} · ` : "";
                        return `${prefix}${dateStr} · ${sel.puntos} puntos · ${sel.rutas} rutas · ${sesionId.substring(0,10)}`;
                      })() : "— Selecciona una sesión —"}
                    </span>
                    <span style={{ color:C.textMuted, transform:sesionDropdownOpen?"rotate(180deg)":"none", transition:"transform 0.15s" }}>▾</span>
                  </button>
                  {sesionDropdownOpen && (
                    <div ref={sesionListRef} style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, maxHeight:340, overflowY:"auto", backgroundColor:C.white, border:"1px solid "+C.border, borderRadius:8, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", zIndex:50 }}>
                      {[...historico].reverse().map(h => {
                        const dateStr = new Date(h.fecha).toLocaleString("es-MX", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
                        const isSel = sesionId === h.sesion;
                        return (
                          <button key={h.sesion} onClick={() => { loadSesion(h.sesion); setSesionDropdownOpen(false); }}
                            style={{ display:"block", width:"100%", padding:"9px 14px", textAlign:"left", border:"none", borderBottom:"1px solid "+C.border, backgroundColor:isSel?C.accentLight:C.white, color:isSel?C.accent:C.text, fontSize:13, fontWeight:isSel?700:500, cursor:"pointer" }}
                            onMouseEnter={ev => { if (!isSel) ev.currentTarget.style.backgroundColor = "#FAFBFF"; }}
                            onMouseLeave={ev => { if (!isSel) ev.currentTarget.style.backgroundColor = C.white; }}>
                            {h.nombre && <span style={{ fontWeight:700, color:isSel?C.accent:C.text }}>{h.nombre} · </span>}{dateStr} · {h.puntos} puntos · {h.rutas} rutas · {h.sesion.substring(0,10)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {sesionId && (() => {
                  const sel = historico.find(h => h.sesion === sesionId);
                  if (!sel) return null;
                  const dateStr = new Date(sel.fecha).toLocaleString("es-MX", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
                  return (
                    <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:11, color:C.textMuted, flexWrap:"wrap" }}>
                      {sel.nombre && <span style={{ padding:"2px 8px", borderRadius:4, backgroundColor:C.accentLight, color:C.accent, fontWeight:700, fontSize:12 }}>{sel.nombre}</span>}
                      <span style={{ fontWeight:600, color:C.text }}>{dateStr}</span>
                      <span style={{ padding:"2px 8px", borderRadius:4, backgroundColor:C.blueBg, color:C.blue, fontWeight:700 }}>{sel.puntos} puntos</span>
                      <span style={{ padding:"2px 8px", borderRadius:4, backgroundColor:C.purpleBg, color:C.purple, fontWeight:700 }}>{sel.rutas} rutas</span>
                      <button onClick={() => eliminarSesion(sesionId)} disabled={deletingSesion}
                        title="Eliminar esta sesión (puntos + asignaciones guardadas) — útil para limpiar duplicados"
                        style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:6, border:"1px solid "+C.red, backgroundColor:C.redBg, color:C.red, fontSize:11, fontWeight:700, cursor:deletingSesion?"not-allowed":"pointer", opacity:deletingSesion?0.6:1 }}>
                        <IC.Trash /> Eliminar sesión
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Recomendación de asignación */}
          {loadingSession && <div style={{ padding:32, textAlign:"center", color:C.textMuted }}>Cargando sesión...</div>}
          {sesionId && !loadingSession && rutas.length > 0 && (() => {
            const totalCostoAsignado = rutas.reduce((s, ruta) => {
              const a = asignacion[ruta.nombre];
              if (!a || a.noAsignar) return s;
              const car = carriers.find(c => c.proveedor === a.proveedor && c.tipo_unidad === a.tipo_unidad);
              return s + ((parseFloat(car?.costo_unidad) || 0) * (a.unidades || 1));
            }, 0);
            const rutasAsignadas = rutas.filter(r => { const aa = asignacion[r.nombre]; return aa && !aa.noAsignar; });
            const rutasNoSalen = rutas.filter(r => { const aa = asignacion[r.nombre]; return aa && aa.noAsignar; });
            const totalPaquetes = rutas.reduce((s, r) => s + r.paquetes, 0);
            const paqAsignados = rutasAsignadas.reduce((s, r) => s + r.paquetes, 0);
            const costoPromPaq = paqAsignados > 0 ? totalCostoAsignado / paqAsignados : 0;
            return (
            <>
              {/* Stat cards resumen asignación */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:14, marginBottom:16 }}>
                {[
                  { label:"Rutas asignadas", value:rutasAsignadas.length+" / "+rutas.length, color:C.blue },
                  { label:"No salen", value:rutasNoSalen.length, color:rutasNoSalen.length>0?C.red:C.textMuted },
                  { label:"Paquetes asignados", value:paqAsignados+" / "+totalPaquetes, color:C.text },
                  { label:"Costo total", value:"$"+totalCostoAsignado.toLocaleString(), color:C.green },
                  { label:"Costo promedio/paq", value:paqAsignados>0?"$"+costoPromPaq.toFixed(1):"—", color:costoPromPaq<=COSTO_IDEAL?C.green:costoPromPaq<=COSTO_MAX?"#CA8A04":C.red },
                ].map(s => (
                  <div key={s.label} style={{ backgroundColor:C.white, borderRadius:10, padding:"14px 16px", border:"1px solid "+C.border }}>
                    <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Tabla de asignación interactiva */}
              <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, overflow:"hidden", marginBottom:16 }}>
                <div style={{ padding:"13px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Asignación de rutas — {rutas.length} rutas</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>Sesión: {sesionId.substring(0,10)} · Click en una ruta para ver opciones</div>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor:C.bg }}>
                        {(() => {
                          const toggle = key => {
                            if (sortBy !== key) { setSortBy(key); setSortDir("desc"); }
                            else if (sortDir === "desc") setSortDir("asc");
                            else { setSortBy(null); setSortDir("desc"); }
                          };
                          const arrow = key => sortBy !== key ? <span style={{ color:C.border, marginLeft:4 }}>↕</span> : <span style={{ color:C.accent, marginLeft:4, fontWeight:800 }}>{sortDir === "desc" ? "↓" : "↑"}</span>;
                          const sortable = (label, key) => (
                            <th key={label} onClick={() => toggle(key)} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:sortBy===key?C.accent:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap", cursor:"pointer", userSelect:"none" }}>
                              {label}{arrow(key)}
                            </th>
                          );
                          const plain = label => (
                            <th key={label} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap" }}>{label}</th>
                          );
                          return [
                            plain(""),
                            plain("Ruta"),
                            sortable("Paquetes", "paquetes"),
                            plain("Proveedor asignado"),
                            plain("Tipo"),
                            plain("Unidades"),
                            sortable("Costo/Día", "costoDia"),
                            sortable("Costo/Paq", "costoPaq"),
                            plain("Estado"),
                          ];
                        })()}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        if (!sortBy) return rutas;
                        const compute = ruta => {
                          if (sortBy === "paquetes") return ruta.paquetes;
                          const a = asignacion[ruta.nombre];
                          if (!a || a.noAsignar) return sortDir === "desc" ? -Infinity : Infinity;
                          const car = carriers.find(c => c.proveedor === a.proveedor && c.tipo_unidad === a.tipo_unidad);
                          const costoTotal = (parseFloat(car?.costo_unidad) || 0) * (a.unidades || 1);
                          if (sortBy === "costoDia") return costoTotal;
                          if (sortBy === "costoPaq") return ruta.paquetes > 0 ? costoTotal / ruta.paquetes : (sortDir === "desc" ? -Infinity : Infinity);
                          return 0;
                        };
                        const sign = sortDir === "desc" ? -1 : 1;
                        return [...rutas].sort((x, y) => sign * (compute(x) - compute(y)));
                      })().map((ruta, idx) => {
                        const a = asignacion[ruta.nombre];
                        const noAsignar = a && a.noAsignar;
                        const opciones = getRecomendacion(ruta.paquetes);
                        const isExpanded = expandedRuta === ruta.nombre;
                        const car = (a && !noAsignar) ? carriers.find(c => c.proveedor === a.proveedor && c.tipo_unidad === a.tipo_unidad) : null;
                        const costoUnit = parseFloat(car?.costo_unidad) || 0;
                        const costoTotal = noAsignar ? 0 : costoUnit * (a?.unidades || 1);
                        const costoPorPaq = (!noAsignar && ruta.paquetes > 0) ? costoTotal / ruta.paquetes : 0;
                        const sinOpcion = opciones.length === 0;
                        const esIdeal = !noAsignar && costoPorPaq > 0 && costoPorPaq <= COSTO_IDEAL;
                        const esViable = !noAsignar && costoPorPaq > 0 && costoPorPaq <= COSTO_MAX;
                        const tc = (a && !noAsignar) ? (tipoColors[a.tipo_unidad] || {bg:"#F3F4F6",c:"#7C8495"}) : null;
                        return [
                          <tr key={idx} style={{ borderTop:"1px solid "+C.border, backgroundColor:noAsignar?"#F9FAFB":sinOpcion?"#FEF2F2":isExpanded?C.blueBg+"66":"transparent", cursor:"pointer", opacity:noAsignar?0.6:1 }}
                            onClick={() => setExpandedRuta(isExpanded?null:ruta.nombre)}
                            onMouseEnter={ev=>{if(!isExpanded&&!sinOpcion&&!noAsignar)ev.currentTarget.style.backgroundColor="#FAFBFF"}}
                            onMouseLeave={ev=>{ev.currentTarget.style.backgroundColor=noAsignar?"#F9FAFB":sinOpcion?"#FEF2F2":isExpanded?C.blueBg+"66":"transparent"}}>
                            <td style={{ padding:"10px 8px 10px 14px", fontSize:12, color:C.textMuted }}>{isExpanded ? "▼" : "▶"}</td>
                            <td style={{ padding:"10px 14px", fontSize:13, fontWeight:700 }}>{ruta.nombre}</td>
                            <td style={{ padding:"10px 14px" }}>
                              <span style={{ fontSize:16, fontWeight:800, color:sinOpcion?C.red:C.text }}>{ruta.paquetes}</span>
                            </td>
                            <td style={{ padding:"10px 14px", fontSize:13, fontWeight:600, color:noAsignar?C.textMuted:C.text, fontStyle:noAsignar?"italic":"normal" }}>{noAsignar ? "No asignar" : a ? a.proveedor : "—"}</td>
                            <td style={{ padding:"10px 14px" }}>
                              {tc ? <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4, backgroundColor:tc.bg, color:tc.c }}>{a.tipo_unidad}</span> : "—"}
                            </td>
                            <td style={{ padding:"10px 14px", fontSize:14, fontWeight:700 }}>{(a && !noAsignar) ? a.unidades : "—"}</td>
                            <td style={{ padding:"10px 14px", fontSize:13, fontWeight:700, color:(a&&!noAsignar)?C.green:C.textMuted }}>{(a && !noAsignar) ? "$"+costoTotal.toLocaleString() : "—"}</td>
                            <td style={{ padding:"10px 14px" }}>
                              {(a && !noAsignar) ? <span style={{ fontSize:14, fontWeight:800, color:esIdeal?C.green:esViable?"#CA8A04":C.red }}>${costoPorPaq.toFixed(1)}</span> : "—"}
                            </td>
                            <td style={{ padding:"10px 14px" }}>
                              {noAsignar ? (
                                <span style={{ fontSize:11, fontWeight:700, color:C.textMuted, padding:"3px 10px", borderRadius:20, backgroundColor:C.bg, border:"1px solid "+C.border }}>No sale</span>
                              ) : sinOpcion ? (
                                <span style={{ fontSize:11, fontWeight:700, color:C.red, padding:"3px 10px", borderRadius:20, backgroundColor:C.redBg }}>Sin opción</span>
                              ) : esIdeal ? (
                                <span style={{ fontSize:11, fontWeight:700, color:C.green, padding:"3px 10px", borderRadius:20, backgroundColor:"#F0FDF4" }}>Ideal</span>
                              ) : esViable ? (
                                <span style={{ fontSize:11, fontWeight:700, color:"#CA8A04", padding:"3px 10px", borderRadius:20, backgroundColor:"#FEF9C3" }}>Viable</span>
                              ) : a ? (
                                <span style={{ fontSize:11, fontWeight:700, color:C.red, padding:"3px 10px", borderRadius:20, backgroundColor:C.redBg }}>Excede máx</span>
                              ) : (
                                <span style={{ fontSize:11, color:C.textMuted }}>Sin asignar</span>
                              )}
                            </td>
                          </tr>,
                          isExpanded && (
                            <tr key={idx+"_exp"} style={{ backgroundColor:C.bg }}>
                              <td colSpan={9} style={{ padding:0 }}>
                                <div style={{ padding:"8px 14px 12px" }}>
                                  {(() => {
                                    const provsList = [...new Set(carriers.map(c => c.proveedor))].sort();
                                    const tipoOrder = ["Moto","Sedan","SmallVan","Van","1.5","3.5","Rabon","Torton","Tracto"];
                                    const tiposList = [...new Set(carriers.map(c => c.tipo_unidad))].sort((x, y) => (tipoOrder.indexOf(x)===-1?99:tipoOrder.indexOf(x)) - (tipoOrder.indexOf(y)===-1?99:tipoOrder.indexOf(y)));
                                    const getCarrierCost = (prov, tipo) => { const c = carriers.find(x => x.proveedor === prov && x.tipo_unidad === tipo); return c ? parseFloat(c.costo_unidad) || 0 : null; };
                                    return (
                                      <div style={{ overflowX:"auto" }}>
                                        <table style={{ width:"100%", borderCollapse:"collapse", borderRadius:8, overflow:"hidden", border:"1px solid "+C.border, backgroundColor:C.white }}>
                                          <thead>
                                            <tr>
                                              <th style={{ padding:"8px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", backgroundColor:"#F8FAFC", borderBottom:"1px solid "+C.border, position:"sticky", left:0, zIndex:1 }}>Proveedor</th>
                                              {tiposList.map(t => {
                                                const ttc = tipoColors[t] || {bg:"#F3F4F6",c:"#7C8495"};
                                                return <th key={t} style={{ padding:"8px 10px", textAlign:"center", backgroundColor:"#F8FAFC", borderBottom:"1px solid "+C.border, minWidth:80 }}>
                                                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4, backgroundColor:ttc.bg, color:ttc.c }}>{t}</span>
                                                </th>;
                                              })}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {provsList.map((prov, pi) => (
                                              <tr key={prov} style={{ borderTop:pi>0?"1px solid "+C.border:"none" }}>
                                                <td style={{ padding:"10px 14px", fontSize:12, fontWeight:700, whiteSpace:"nowrap", position:"sticky", left:0, backgroundColor:C.white, zIndex:1 }}>{prov}</td>
                                                {tiposList.map(tipo => {
                                                  const cost = getCarrierCost(prov, tipo);
                                                  if (cost === null) return <td key={tipo} style={{ padding:"6px 8px", textAlign:"center", color:C.border, fontSize:11 }}>—</td>;
                                                  const cpq = ruta.paquetes > 0 ? cost / ruta.paquetes : 0;
                                                  const isIdeal = cpq <= COSTO_IDEAL;
                                                  const isViable = cpq <= COSTO_MAX;
                                                  const isSel = a && !noAsignar && a.proveedor === prov && a.tipo_unidad === tipo;
                                                  return (
                                                    <td key={tipo} style={{ padding:"4px 4px", textAlign:"center" }}>
                                                      <div onClick={(e) => { e.stopPropagation(); setAsignacion({...asignacion, [ruta.nombre]: { proveedor: prov, tipo_unidad: tipo, unidades: 1 }}); }}
                                                        style={{ padding:"8px 6px", borderRadius:6, cursor:"pointer", border:"2px solid "+(isSel?C.blue:isIdeal?"#BBF7D0":isViable?"#FDE68A":"#FECACA"), backgroundColor:isSel?C.blueBg:isIdeal?"#F0FDF4":isViable?"#FFFBEB":"#FEF2F2", transition:"all 0.1s" }}
                                                        onMouseEnter={ev=>{if(!isSel)ev.currentTarget.style.transform="scale(1.05)"}}
                                                        onMouseLeave={ev=>{ev.currentTarget.style.transform="scale(1)"}}>
                                                        <div style={{ fontSize:13, fontWeight:800, color:isIdeal?C.green:isViable?"#CA8A04":C.red }}>${cpq.toFixed(1)}</div>
                                                        <div style={{ fontSize:9, color:C.textMuted, marginTop:1 }}>${cost.toLocaleString()}/día</div>
                                                        {isSel && <div style={{ fontSize:8, fontWeight:800, color:C.blue, marginTop:2 }}>ASIGNADO</div>}
                                                      </div>
                                                    </td>
                                                  );
                                                })}
                                              </tr>
                                            ))}
                                            {/* No asignar row */}
                                            <tr style={{ borderTop:"2px solid "+C.border }}>
                                              <td colSpan={tiposList.length + 1} style={{ padding:"6px 14px" }}>
                                                <div onClick={(e) => { e.stopPropagation(); setAsignacion({...asignacion, [ruta.nombre]: { noAsignar: true }}); }}
                                                  style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:6, cursor:"pointer", border:"2px solid "+(noAsignar?C.red:C.border), backgroundColor:noAsignar?"#FEF2F2":"transparent" }}
                                                  onMouseEnter={ev=>{if(!noAsignar)ev.currentTarget.style.backgroundColor="#FEF2F2"}}
                                                  onMouseLeave={ev=>{ev.currentTarget.style.backgroundColor=noAsignar?"#FEF2F2":"transparent"}}>
                                                  <div style={{ width:14, height:14, borderRadius:7, border:"2px solid "+(noAsignar?C.red:C.border), backgroundColor:noAsignar?C.red:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                                    {noAsignar && <div style={{ width:5, height:5, borderRadius:3, backgroundColor:"white" }} />}
                                                  </div>
                                                  <span style={{ fontSize:12, fontWeight:600, color:noAsignar?C.red:C.textMuted, fontStyle:"italic" }}>No asignar — esta ruta no sale</span>
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </td>
                            </tr>
                          )
                        ];
                      })}
                      <tr style={{ backgroundColor:"#FAFBFF", borderTop:"2px solid "+C.border }}>
                        <td />
                        <td style={{ padding:"10px 14px", fontSize:13, fontWeight:800 }}>TOTAL</td>
                        <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800 }}>{totalPaquetes}</td>
                        <td colSpan={3} style={{ padding:"10px 14px" }}>
                          <span style={{ fontSize:11, fontWeight:600, color:C.green, marginRight:10 }}>
                            {rutas.filter(r => { const aa=asignacion[r.nombre]; if(!aa||aa.noAsignar) return false; const cc=carriers.find(c=>c.proveedor===aa.proveedor&&c.tipo_unidad===aa.tipo_unidad); const ct=(parseFloat(cc?.costo_unidad)||0)*(aa.unidades||1); return r.paquetes>0&&ct/r.paquetes<=COSTO_IDEAL; }).length} ideales
                          </span>
                          <span style={{ fontSize:11, fontWeight:600, color:"#CA8A04", marginRight:10 }}>
                            {rutas.filter(r => { const aa=asignacion[r.nombre]; if(!aa||aa.noAsignar) return false; const cc=carriers.find(c=>c.proveedor===aa.proveedor&&c.tipo_unidad===aa.tipo_unidad); const ct=(parseFloat(cc?.costo_unidad)||0)*(aa.unidades||1); const cp=r.paquetes>0?ct/r.paquetes:Infinity; return cp>COSTO_IDEAL&&cp<=COSTO_MAX; }).length} viables
                          </span>
                          <span style={{ fontSize:11, fontWeight:600, color:C.textMuted, marginRight:10 }}>
                            {rutasNoSalen.length} no salen
                          </span>
                          <span style={{ fontSize:11, fontWeight:600, color:C.red }}>
                            {rutas.filter(r => { const aa=asignacion[r.nombre]; return !aa || (!aa.noAsignar && getRecomendacion(r.paquetes).length===0); }).length} sin opción
                          </span>
                        </td>
                        <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800, color:C.green }}>${totalCostoAsignado.toLocaleString()}</td>
                        <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800, color:paqAsignados>0?(costoPromPaq<=COSTO_IDEAL?C.green:costoPromPaq<=COSTO_MAX?"#CA8A04":C.red):C.textMuted }}>{paqAsignados>0?"$"+costoPromPaq.toFixed(1):"—"}</td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumen por proveedor */}
              {(() => {
                const resumenProv = {};
                rutas.forEach(ruta => {
                  const a = asignacion[ruta.nombre];
                  if (!a || a.noAsignar) return;
                  const key = a.proveedor + "|" + a.tipo_unidad;
                  if (!resumenProv[key]) resumenProv[key] = { proveedor: a.proveedor, tipo_unidad: a.tipo_unidad, rutas: 0, unidades: 0, paquetes: 0, costo: 0 };
                  const car = carriers.find(c => c.proveedor === a.proveedor && c.tipo_unidad === a.tipo_unidad);
                  resumenProv[key].rutas += 1;
                  resumenProv[key].unidades += a.unidades || 1;
                  resumenProv[key].paquetes += ruta.paquetes;
                  resumenProv[key].costo += (parseFloat(car?.costo_unidad) || 0) * (a.unidades || 1);
                });
                const resList = Object.values(resumenProv).sort((a, b) => b.costo - a.costo);
                if (resList.length === 0) return null;
                return (
                  <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, overflow:"hidden" }}>
                    <div style={{ padding:"13px 18px", borderBottom:"1px solid "+C.border, fontSize:13, fontWeight:700, color:C.text }}>Resumen de asignación por proveedor</div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <thead>
                          <tr style={{ backgroundColor:C.bg }}>
                            {["Proveedor","Tipo","Rutas","Unidades","Paquetes","Costo total","Costo/Paq"].map(h => (
                              <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {resList.map((rp, i) => {
                            const cpq = rp.paquetes > 0 ? rp.costo / rp.paquetes : 0;
                            const rtc = tipoColors[rp.tipo_unidad] || {bg:"#F3F4F6",c:"#7C8495"};
                            return (
                              <tr key={i} style={{ borderTop:"1px solid "+C.border }}>
                                <td style={{ padding:"10px 14px", fontSize:13, fontWeight:700 }}>{rp.proveedor}</td>
                                <td style={{ padding:"10px 14px" }}><span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4, backgroundColor:rtc.bg, color:rtc.c }}>{rp.tipo_unidad}</span></td>
                                <td style={{ padding:"10px 14px", fontSize:13, fontWeight:600 }}>{rp.rutas}</td>
                                <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800 }}>{rp.unidades}</td>
                                <td style={{ padding:"10px 14px", fontSize:13, fontWeight:600 }}>{rp.paquetes}</td>
                                <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800, color:C.green }}>${rp.costo.toLocaleString()}</td>
                                <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800, color:cpq<=COSTO_IDEAL?C.green:cpq<=COSTO_MAX?"#CA8A04":C.red }}>${cpq.toFixed(1)}</td>
                              </tr>
                            );
                          })}
                          <tr style={{ backgroundColor:"#FAFBFF", borderTop:"2px solid "+C.border }}>
                            <td style={{ padding:"10px 14px", fontSize:13, fontWeight:800 }}>TOTAL</td>
                            <td />
                            <td style={{ padding:"10px 14px", fontSize:13, fontWeight:800 }}>{resList.reduce((s,r)=>s+r.rutas,0)}</td>
                            <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800 }}>{resList.reduce((s,r)=>s+r.unidades,0)}</td>
                            <td style={{ padding:"10px 14px", fontSize:13, fontWeight:800 }}>{totalPaquetes}</td>
                            <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800, color:C.green }}>${totalCostoAsignado.toLocaleString()}</td>
                            <td style={{ padding:"10px 14px", fontSize:14, fontWeight:800, color:costoPromPaq<=COSTO_IDEAL?C.green:costoPromPaq<=COSTO_MAX?"#CA8A04":C.red }}>${costoPromPaq.toFixed(1)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </>
            );
          })()}
          {sesionId && !loadingSession && rutas.length === 0 && (
            <div style={{ padding:32, textAlign:"center", color:C.textMuted, fontSize:13 }}>No se encontraron rutas en esta sesión.</div>
          )}
        </>
      )}

      {/* Confirm modal — for session deletion (window.confirm() can be browser-suppressed) */}
      {confirmModal && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(12,20,37,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000 }}
          onClick={() => setConfirmModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor:C.white, borderRadius:12, padding:28, width:480, maxWidth:"90vw", boxShadow:"0 12px 48px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize:17, fontWeight:800, color:C.text, marginBottom:10 }}>Confirmar eliminación</div>
            <div style={{ fontSize:13, color:C.textMuted, marginBottom:22, lineHeight:1.5 }}>{confirmModal.message}</div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setConfirmModal(null)} style={{ padding:"9px 20px", borderRadius:8, border:"1px solid "+C.border, backgroundColor:C.white, fontSize:13, fontWeight:600, cursor:"pointer", color:C.text }}>Cancelar</button>
              <button onClick={async () => { const fn = confirmModal.onConfirm; setConfirmModal(null); try { await fn(); } catch (e) { console.error(e); alert("Error: " + e.message); } }} style={{ padding:"9px 22px", borderRadius:8, border:"none", backgroundColor:C.red, color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>Eliminar</button>
            </div>
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

// --- MANIFIESTO ---
function ModuleManifiesto() {
  const [operadores, setOperadores] = useState([]);
  const [manifiestos, setManifiestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOp, setSelectedOp] = useState(null);
  const [guias, setGuias] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [searchMan, setSearchMan] = useState("");
  const printRef = useRef(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    // Keyset pagination on id (unique PK) — no duplicates, no gaps.
    const loadAllAsistencia = async () => {
      const byId = new Map();
      const pageSize = 1000;
      let cursor = null;
      while (true) {
        let q = supabase.from("asistencia").select("*").order("id", { ascending: false }).limit(pageSize);
        if (cursor !== null) q = q.lt("id", cursor);
        const { data: chunk } = await q;
        if (!chunk || chunk.length === 0) break;
        for (const row of chunk) byId.set(row.id, row);
        if (chunk.length < pageSize) break;
        cursor = chunk[chunk.length - 1].id;
      }
      return Array.from(byId.values()).sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || "") || b.id - a.id);
    };
    const [asiData, { data: manData }] = await Promise.all([
      loadAllAsistencia(),
      supabase.from("manifiestos").select("*").order("created_at", { ascending: false }),
    ]);
    // Unique operators from asistencia
    const unique = {};
    (asiData || []).forEach(a => {
      const key = (a.nombre_operador || "").trim().toLowerCase();
      if (key && key !== "registro manual") {
        if (!unique[key]) {
          unique[key] = { nombre: a.nombre_operador, proveedor: a.proveedor, tipo_unidad: a.tipo_unidad, tipo_operacion: a.tipo_operacion || "Última Milla", fecha: a.fecha, id: a.id };
        } else {
          // Always keep the most recent data (query is desc by timestamp, so first hit is newest — but update if we find a newer fecha)
          if ((a.fecha || "") > (unique[key].fecha || "")) {
            unique[key] = { nombre: a.nombre_operador, proveedor: a.proveedor, tipo_unidad: a.tipo_unidad, tipo_operacion: a.tipo_operacion || "Última Milla", fecha: a.fecha, id: a.id };
          }
        }
      }
    });
    setOperadores(Object.values(unique).sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setManifiestos(manData || []);
    setLoading(false);
  };

  const generateId = () => {
    const digits = Math.floor(Math.random() * 9000000000 + 1000000000);
    return "MAN-" + digits;
  };

  const handleGuiasFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg("");
    try {
      let rows = [];
      if (file.name.toLowerCase().endsWith(".csv")) {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        rows = lines.slice(1).map(l => {
          const v = l.split(",").map(x => x.trim().replace(/^"|"$/g, ""));
          const o = {};
          headers.forEach((h, i) => o[h] = v[i] || "");
          return o;
        });
      } else {
        const XLSX = await import("xlsx");
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
        rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      }
      if (rows.length === 0) { setMsg("El archivo está vacío."); setUploading(false); return; }
      // Detect guia column
      const sample = rows[0];
      const guiaCol = Object.keys(sample).find(k => /guia|guía|tracking|no\.?\s*gu[ií]a|n[uú]m/i.test(k)) || Object.keys(sample)[0];
      const parsed = rows.map((r, i) => ({
        numero: String(r[guiaCol] || "").trim(),
        destino: r["Destino"] || r["destino"] || r["Dirección"] || r["direccion"] || "",
        peso: r["Peso"] || r["peso"] || "",
        paquetes: r["Paquetes"] || r["paquetes"] || r["Cantidad"] || r["cantidad"] || "1",
      })).filter(g => g.numero);
      setGuias(parsed);
      setMsg(`${parsed.length} guías cargadas desde columna "${guiaCol}"`);
    } catch (err) {
      setMsg("Error: " + err.message);
    }
    setUploading(false);
  };

  const removeGuia = (idx) => setGuias(guias.filter((_, i) => i !== idx));

  const saveManifiesto = async () => {
    if (!selectedOp || guias.length === 0) return;
    const manId = generateId();
    const now = new Date().toISOString();
    const { error } = await supabase.from("manifiestos").insert({
      id_manifiesto: manId,
      operador: selectedOp.nombre,
      proveedor: selectedOp.proveedor,
      tipo_unidad: selectedOp.tipo_unidad,
      tipo_operacion: selectedOp.tipo_operacion || "Última Milla",
      fecha: now.substring(0, 10),
      total_guias: guias.length,
      guias: JSON.stringify(guias),
      observaciones,
      created_at: now,
    });
    if (error) { setMsg("Error al guardar: " + error.message); return; }
    setMsg("Manifiesto " + manId + " guardado correctamente.");
    generatePDF(manId, selectedOp, guias, observaciones, selectedOp.tipo_operacion);
    setGuias([]);
    setSelectedOp(null);
    setObservaciones("");
    setShowCreate(false);
    loadData();
  };

  const generatePDF = (manId, op, guiasList, obs, tipoOp) => {
    const tipoOperacion = tipoOp || op.tipo_operacion || "Última Milla";
    const fecha = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
    const hora = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    const totalPqtes = guiasList.reduce((s, g) => s + (parseInt(g.paquetes) || 1), 0);
    const guiaRows = guiasList.map((g, i) => `<tr><td style="border:1px solid #000;padding:4px 8px;text-align:center;font-size:11px;">${i + 1}</td><td style="border:1px solid #000;padding:4px 8px;font-family:Courier New,monospace;font-size:11px;font-weight:700;">${g.numero}</td><td style="border:1px solid #000;padding:4px 8px;font-size:10px;">${g.destino || ""}</td></tr>`).join("");
    const emptyRows = Math.max(0, 40 - guiasList.length);
    const emptyRowsHtml = Array.from({length: emptyRows}, (_, i) => `<tr><td style="border:1px solid #000;padding:4px 8px;text-align:center;font-size:11px;color:#999;">${guiasList.length + i + 1}</td><td style="border:1px solid #000;padding:4px 8px;"></td><td style="border:1px solid #000;padding:4px 8px;"></td></tr>`).join("");

    const html = `
      <html><head><title>Manifiesto ${manId}</title>
      <style>
        @page { size: letter; margin: 12mm 15mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; color: #000; font-size: 12px; }
      </style></head><body>
        <div style="text-align:center;margin-bottom:16px;">
          <img src="https://t1envios.com/assets/images/logos/T1Paginas.svg" alt="T1 Envíos" style="height:36px;" />
          <div style="font-size:16px;font-weight:800;margin-top:6px;padding:6px 0;border-top:2px solid #000;border-bottom:2px solid #000;">MANIFIESTO — ${tipoOperacion.toUpperCase()}</div>
          <div style="font-size:10px;color:#666;margin-top:3px;">${manId}</div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
          <tr>
            <td style="padding:6px 0;font-size:12px;width:33%;"><b>Fecha:</b> ${fecha}</td>
            <td style="padding:6px 0;font-size:12px;width:33%;"><b>Operador:</b> ${op.nombre}</td>
            <td style="padding:6px 0;font-size:12px;width:33%;"><b>Compañía:</b> ${op.proveedor || "—"}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:12px;"><b>Ruta:</b> ${guiasList.length} guías</td>
            <td style="padding:6px 0;font-size:12px;"><b>Unidad:</b> ${op.tipo_unidad || "—"}</td>
            <td style="padding:6px 0;font-size:12px;"><b>Hora:</b> ${hora}</td>
          </tr>
        </table>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f0f0f0;border:1px solid #000;margin-bottom:10px;">
          <span style="font-size:13px;font-weight:700;">Paquetes Recibidos: ${totalPqtes}</span>
          <span style="font-size:13px;font-weight:700;">Total Guías: ${guiasList.length}</span>
        </div>

        ${obs ? '<div style="padding:6px 12px;background:#FEF9C3;border:1px solid #D97706;margin-bottom:10px;font-size:11px;"><b>Obs:</b> ' + obs + '</div>' : ''}

        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#0C1425;">
              <th style="border:1px solid #000;padding:6px 8px;color:white;font-size:10px;text-transform:uppercase;width:40px;text-align:center;">N°</th>
              <th style="border:1px solid #000;padding:6px 8px;color:white;font-size:10px;text-transform:uppercase;">GUÍAS</th>
              <th style="border:1px solid #000;padding:6px 8px;color:white;font-size:10px;text-transform:uppercase;width:180px;">OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            ${guiaRows}
            ${emptyRowsHtml}
          </tbody>
        </table>

        <div style="margin-top:30px;display:flex;justify-content:space-around;">
          <div style="text-align:center;width:40%;">
            <div style="border-top:2px solid #000;padding-top:8px;margin-top:40px;">
              <div style="font-size:12px;font-weight:700;">${op.nombre}</div>
              <div style="font-size:10px;color:#666;">Operador — Recibe mercancía</div>
            </div>
          </div>
          <div style="text-align:center;width:40%;">
            <div style="border-top:2px solid #000;padding-top:8px;margin-top:40px;">
              <div style="font-size:12px;font-weight:700;">Almacén T1 Envíos</div>
              <div style="font-size:10px;color:#666;">Responsable — Entrega mercancía</div>
            </div>
          </div>
        </div>

        <div style="margin-top:20px;text-align:center;font-size:8px;color:#999;border-top:1px solid #ddd;padding-top:8px;">
          Documento generado por T1 Envíos OPS Flotilla · ${manId} · ${fecha}
        </div>
      </body></html>
    `;
    // Open in new window, load html2pdf there, auto-download then close
    const w = window.open("", "_blank", "width=800,height=1000");
    w.document.write(html);
    w.document.close();
    const script = w.document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js";
    script.onload = () => {
      setTimeout(() => {
        w.html2pdf().set({
          margin: [10, 12, 10, 12],
          filename: manId + ".pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
        }).from(w.document.body).save().then(() => {
          setTimeout(() => w.close(), 500);
        });
      }, 800);
    };
    w.document.head.appendChild(script);
  };

  const redownload = (m) => {
    const guiasList = JSON.parse(m.guias || "[]");
    generatePDF(m.id_manifiesto, { nombre: m.operador, proveedor: m.proveedor, tipo_unidad: m.tipo_unidad, fecha: m.fecha }, guiasList, m.observaciones || "", m.tipo_operacion);
  };

  const deleteManifiesto = async (id) => {
    if (!confirm("¿Eliminar este manifiesto?")) return;
    await supabase.from("manifiestos").delete().eq("id", id);
    loadData();
  };

  const filteredMan = manifiestos.filter(m => {
    if (!searchMan) return true;
    const s = searchMan.toLowerCase();
    return (m.id_manifiesto || "").toLowerCase().includes(s) || (m.operador || "").toLowerCase().includes(s) || (m.proveedor || "").toLowerCase().includes(s);
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Manifiesto</h1>
          <p style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>Genera manifiestos de carga para operadores registrados en asistencia</p>
        </div>
        <button onClick={() => { setShowCreate(!showCreate); setGuias([]); setSelectedOp(null); setMsg(""); setObservaciones(""); }} style={{
          padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: showCreate ? C.textMuted : C.accent,
          color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        }}>
          {showCreate ? <><IC.X /> Cancelar</> : <><IC.Plus /> Nuevo manifiesto</>}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <StatCard label="Manifiestos generados" value={manifiestos.length.toString()} icon={<IC.ClipboardCheck />} color={C.blue} />
        <StatCard label="Operadores en asistencia" value={operadores.length.toString()} icon={<IC.Users />} color={C.green} />
        <StatCard label="Total guías despachadas" value={manifiestos.reduce((s, m) => s + (m.total_guias || 0), 0).toLocaleString()} icon={<IC.Package />} color={C.accent} />
        <StatCard label="Hoy" value={manifiestos.filter(m => (m.fecha || "").substring(0, 10) === new Date().toISOString().substring(0, 10)).length.toString()} subvalue="manifiestos hoy" icon={<IC.Clock />} color={C.purple} />
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: 24, border: "2px solid " + C.accent, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: C.accent }}>Nuevo manifiesto de carga</div>

          {/* Step 1: Select operator */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Paso 1 — Seleccionar operador (registrado en asistencia)</div>
            {operadores.length === 0 ? (
              <div style={{ padding: "16px", backgroundColor: C.yellowBg, borderRadius: 8, fontSize: 13, color: C.yellow, fontWeight: 600 }}>
                No hay operadores registrados en asistencia. Primero registra operadores en el módulo "Registro Diario".
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                {operadores.map((op, i) => {
                  const isSel = selectedOp && selectedOp.nombre === op.nombre;
                  return (
                    <button key={i} onClick={() => setSelectedOp(op)} style={{
                      padding: "12px 16px", borderRadius: 10, border: isSel ? "2px solid " + C.accent : "1px solid " + C.border,
                      backgroundColor: isSel ? C.accentLight : C.white, cursor: "pointer", textAlign: "left",
                      transition: "all 0.15s",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{op.nombre}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{op.proveedor} · {op.tipo_unidad} · {op.tipo_operacion}</div>
                      <div style={{ fontSize: 10, color: C.textMuted, marginTop: 1 }}>Asistencia: {op.fecha}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Upload guías */}
          {selectedOp && (
            <div style={{ marginBottom: 18, borderTop: "1px solid " + C.border, paddingTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Paso 2 — Cargar archivo de guías</div>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 300px" }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Archivo Excel o CSV con guías</label>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleGuiasFile} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 13, boxSizing: "border-box", backgroundColor: "#FAFBFF" }} />
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>Columna de guía detectada automáticamente. Columnas opcionales: Destino, Peso, Paquetes.</div>
                </div>
              </div>
              {uploading && <div style={{ marginTop: 8, fontSize: 13, color: C.blue, fontWeight: 600 }}>Procesando...</div>}
              {msg && <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: msg.startsWith("Error") ? C.red : C.green }}>{msg}</div>}
            </div>
          )}

          {/* Guías preview table */}
          {guias.length > 0 && (
            <div style={{ marginBottom: 18, borderTop: "1px solid " + C.border, paddingTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Paso 3 — Revisar guías ({guias.length})</div>
              <div style={{ maxHeight: 260, overflowY: "auto", border: "1px solid " + C.border, borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid " + C.border, backgroundColor: "#FAFBFF" }}>
                      {["#", "No. Guía", "Destino", "Peso", "Paquetes", ""].map(h => (
                        <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guias.map((g, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid " + C.border }}>
                        <td style={{ padding: "6px 12px", fontSize: 12, color: C.textMuted }}>{i + 1}</td>
                        <td style={{ padding: "6px 12px", fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: C.text }}>{g.numero}</td>
                        <td style={{ padding: "6px 12px", fontSize: 12, color: C.textMuted }}>{g.destino || "—"}</td>
                        <td style={{ padding: "6px 12px", fontSize: 12, color: C.textMuted }}>{g.peso || "—"}</td>
                        <td style={{ padding: "6px 12px", fontSize: 12, fontWeight: 600 }}>{g.paquetes || 1}</td>
                        <td style={{ padding: "6px 12px" }}>
                          <button onClick={() => removeGuia(i)} style={{ padding: "2px 6px", borderRadius: 4, border: "none", backgroundColor: C.redBg, cursor: "pointer", color: C.red, fontSize: 10 }}><IC.X /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Observaciones */}
              <div style={{ marginTop: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Observaciones (opcional)</label>
                <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Notas adicionales para el manifiesto..." rows={2} style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid " + C.border, fontSize: 13, boxSizing: "border-box", resize: "vertical" }} />
              </div>

              {/* Summary + save */}
              <div style={{ marginTop: 14, padding: "14px 18px", borderRadius: 8, backgroundColor: "#F0FDF4", border: "1px solid " + C.green + "40", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Operador: <strong>{selectedOp.nombre}</strong> · {selectedOp.proveedor}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{guias.length} guías · {guias.reduce((s, g) => s + (parseInt(g.paquetes) || 1), 0)} paquetes totales</div>
                </div>
                <button onClick={saveManifiesto} style={{
                  padding: "10px 28px", borderRadius: 8, border: "none", backgroundColor: C.green,
                  color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <IC.Download /> Generar manifiesto y PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 8, backgroundColor: C.white, border: "1px solid " + C.border, flex: "0 1 340px" }}>
          <IC.Search />
          <input placeholder="Buscar por ID, operador o proveedor..." value={searchMan} onChange={e => setSearchMan(e.target.value)} style={{ border: "none", outline: "none", backgroundColor: "transparent", fontSize: 13, width: "100%", color: C.text }} />
        </div>
        <span style={{ fontSize: 12, color: C.textMuted }}>{filteredMan.length} manifiesto{filteredMan.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Manifiestos table */}
      <div style={{ backgroundColor: C.white, borderRadius: 12, border: "1px solid " + C.border, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Cargando...</div>
        ) : filteredMan.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.textMuted }}>Sin manifiestos registrados</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Usa "Nuevo manifiesto" para crear uno</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid " + C.border }}>
                {["ID Manifiesto", "Fecha", "Operador", "Proveedor", "Unidad", "Tipo", "Guías", "Notas", "Acciones"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMan.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid " + C.border }}
                  onMouseEnter={ev => ev.currentTarget.style.backgroundColor = "#FAFBFF"}
                  onMouseLeave={ev => ev.currentTarget.style.backgroundColor = "transparent"}>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: C.accent }}>{m.id_manifiesto}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: C.textMuted }}>{m.fecha}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: C.text }}>{m.operador}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: C.textMuted }}>{m.proveedor}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, backgroundColor: C.blueBg, color: C.blue }}>{m.tipo_unidad}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {(() => {
                      const tp = m.tipo_operacion || "Última Milla";
                      const tpMap = { "Última Milla": { bg: C.accentLight, c: C.accent }, "CrossDock": { bg: C.blueBg, c: C.blue }, "Logística Inversa": { bg: C.purpleBg, c: C.purple } };
                      const tc = tpMap[tp] || { bg: "#F3F4F6", c: C.textMuted };
                      return <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, backgroundColor: tc.bg, color: tc.c }}>{tp}</span>;
                    })()}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 700, color: C.text }}>{m.total_guias}</td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    {m.observaciones && m.observaciones.trim() !== "" ? (
                      <span title={m.observaciones} style={{ color: "#2E7D32", fontSize: 18, cursor: "help" }}>✓</span>
                    ) : (
                      <span style={{ color: C.textMuted, fontSize: 13 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px", display: "flex", gap: 6 }}>
                    <button onClick={() => redownload(m)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid " + C.accent, backgroundColor: C.accentLight, color: C.accent, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <IC.Download /> PDF
                    </button>
                    <button onClick={() => deleteManifiesto(m.id)} style={{ padding: "5px 8px", borderRadius: 6, border: "none", backgroundColor: C.redBg, cursor: "pointer", color: C.red }}><IC.Trash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SQL hint */}
      {manifiestos.length === 0 && !loading && (
        <div style={{ marginTop: 20, fontSize: 11, color: C.textMuted, backgroundColor: C.bg, padding: "14px 20px", borderRadius: 8, border: "1px solid " + C.border }}>
          <b>SQL requerido en Supabase:</b>
          <pre style={{ fontSize: 10, marginTop: 8, whiteSpace: "pre-wrap", color: C.text }}>{`CREATE TABLE manifiestos (
  id bigserial PRIMARY KEY,
  id_manifiesto text UNIQUE NOT NULL,
  operador text,
  proveedor text,
  tipo_unidad text,
  fecha text,
  total_guias int,
  guias jsonb,
  observaciones text,
  created_at timestamptz DEFAULT now()
);`}</pre>
        </div>
      )}
    </div>
  );
}

// --- CONSULTAS (estilo Minitab — sin SQL crudo) ---
function ModuleConsultas() {
  // Catálogo de tablas + columnas-tipo (etiqueta amigable, tipo de dato)
  const TABLAS = {
    rutas: {
      label: "Rutas (Registrar Envíos)",
      columnas: [
        { id: "id", label: "ID", tipo: "number" },
        { id: "id_ruta", label: "ID Ruta", tipo: "text" },
        { id: "carrier", label: "Carrier / Proveedor", tipo: "text" },
        { id: "operador", label: "Operador", tipo: "text" },
        { id: "tipo_ruta", label: "Tipo Ruta", tipo: "text" },
        { id: "status", label: "Status", tipo: "text" },
        { id: "total", label: "Total Paquetes", tipo: "number" },
        { id: "entregados", label: "Entregados", tipo: "number" },
        { id: "intentados", label: "Intentados", tipo: "number" },
        { id: "no_visitados", label: "No Visitados", tipo: "number" },
        { id: "recolecciones", label: "Recolecciones", tipo: "number" },
        { id: "pct_entrega", label: "% Entrega", tipo: "number" },
        { id: "intercambios", label: "Intercambios", tipo: "number" },
        { id: "fecha_salida", label: "Fecha Salida", tipo: "date" },
        { id: "fecha_registro", label: "Fecha Registro", tipo: "date" },
        { id: "almacen", label: "Almacén", tipo: "text" },
        { id: "placa", label: "Placa", tipo: "text" },
        { id: "economico", label: "Económico", tipo: "text" },
        { id: "correo_operador", label: "Correo Operador", tipo: "text" },
        { id: "penalizacion", label: "Penalización", tipo: "text" },
        { id: "nota", label: "Nota", tipo: "text" },
      ],
    },
    asistencia: {
      label: "Asistencia (Registro Diario)",
      columnas: [
        { id: "id", label: "ID", tipo: "number" },
        { id: "fecha", label: "Fecha", tipo: "date" },
        { id: "timestamp", label: "Timestamp", tipo: "date" },
        { id: "proveedor", label: "Proveedor", tipo: "text" },
        { id: "nombre_operador", label: "Operador", tipo: "text" },
        { id: "tipo_unidad", label: "Tipo Unidad", tipo: "text" },
        { id: "tipo_operacion", label: "Tipo Operación", tipo: "text" },
        { id: "latitud", label: "Latitud", tipo: "number" },
        { id: "longitud", label: "Longitud", tipo: "number" },
        { id: "placa", label: "Placa", tipo: "text" },
        { id: "correo", label: "Correo", tipo: "text" },
      ],
    },
    operadores: {
      label: "Operadores",
      columnas: [
        { id: "id", label: "ID", tipo: "number" },
        { id: "nombre", label: "Nombre", tipo: "text" },
        { id: "proveedor", label: "Proveedor", tipo: "text" },
        { id: "tipo_licencia", label: "Tipo Licencia", tipo: "text" },
        { id: "activo", label: "Activo", tipo: "boolean" },
      ],
    },
    carriers: {
      label: "Carriers (Catálogo)",
      columnas: [
        { id: "id", label: "ID", tipo: "number" },
        { id: "proveedor", label: "Proveedor", tipo: "text" },
        { id: "tipo_unidad", label: "Tipo Unidad", tipo: "text" },
        { id: "operacion", label: "Operación", tipo: "text" },
        { id: "costo_unidad", label: "Costo / Unidad", tipo: "number" },
      ],
    },
    asignaciones_sesion: {
      label: "Asignaciones por sesión",
      columnas: [
        { id: "id", label: "ID", tipo: "number" },
        { id: "sesion", label: "Sesión", tipo: "text" },
        { id: "ruta_nombre", label: "Ruta", tipo: "text" },
        { id: "proveedor", label: "Proveedor", tipo: "text" },
        { id: "tipo_unidad", label: "Tipo Unidad", tipo: "text" },
        { id: "unidades", label: "Unidades", tipo: "number" },
        { id: "no_asignar", label: "No Asignar", tipo: "boolean" },
        { id: "created_at", label: "Creado", tipo: "date" },
      ],
    },
    ruteo_puntos: {
      label: "Puntos de Ruteo",
      columnas: [
        { id: "id", label: "ID", tipo: "number" },
        { id: "sesion", label: "Sesión", tipo: "text" },
        { id: "nombre", label: "Nombre Sesión", tipo: "text" },
        { id: "indice", label: "Índice", tipo: "number" },
        { id: "cluster", label: "Cluster", tipo: "number" },
        { id: "ruta", label: "Ruta", tipo: "text" },
        { id: "latitud", label: "Latitud", tipo: "number" },
        { id: "longitud", label: "Longitud", tipo: "number" },
        { id: "created_at", label: "Creado", tipo: "date" },
      ],
    },
  };

  const OPERADORES_FILTRO = {
    text: [
      { id: "eq", label: "es igual a" },
      { id: "neq", label: "no es igual a" },
      { id: "ilike", label: "contiene" },
      { id: "is_null", label: "está vacío" },
      { id: "not_null", label: "no está vacío" },
    ],
    number: [
      { id: "eq", label: "=" },
      { id: "neq", label: "≠" },
      { id: "gt", label: ">" },
      { id: "gte", label: "≥" },
      { id: "lt", label: "<" },
      { id: "lte", label: "≤" },
      { id: "is_null", label: "está vacío" },
      { id: "not_null", label: "no está vacío" },
    ],
    date: [
      { id: "gte", label: "≥ fecha" },
      { id: "lte", label: "≤ fecha" },
      { id: "eq", label: "= fecha" },
    ],
    boolean: [
      { id: "eq", label: "es igual a" },
    ],
  };

  const [tabla, setTabla] = useState("rutas");
  const [columnasSeleccionadas, setColumnasSeleccionadas] = useState(() => TABLAS.rutas.columnas.slice(0, 8).map(c => c.id));
  const [filtros, setFiltros] = useState([]); // [{ col, op, val }]
  const [orderBy, setOrderBy] = useState("id");
  const [orderDir, setOrderDir] = useState("desc");
  const [limite, setLimite] = useState(500);
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agruparPor, setAgruparPor] = useState(""); // "" = sin agrupación, sino columna id
  const [busqueda, setBusqueda] = useState("");

  const colDef = TABLAS[tabla];
  const colMap = Object.fromEntries(colDef.columnas.map(c => [c.id, c]));

  const cambiarTabla = (t) => {
    setTabla(t);
    setColumnasSeleccionadas(TABLAS[t].columnas.slice(0, 8).map(c => c.id));
    setFiltros([]);
    setOrderBy(TABLAS[t].columnas[0].id);
    setResultados(null);
    setError("");
    setAgruparPor("");
    setBusqueda("");
  };

  // Filtra resultados con búsqueda libre (busca en cualquier columna seleccionada)
  const resultadosFiltrados = (() => {
    if (!resultados) return null;
    if (!busqueda.trim()) return resultados;
    const q = busqueda.toLowerCase().trim();
    const cols = columnasSeleccionadas.length > 0 ? columnasSeleccionadas : Object.keys(resultados[0] || {});
    return resultados.filter(r => cols.some(c => String(r[c] ?? "").toLowerCase().includes(q)));
  })();

  // Estadísticas: por cada columna numérica seleccionada, calcula count/sum/avg/min/max
  const stats = (() => {
    if (!resultadosFiltrados || resultadosFiltrados.length === 0) return [];
    const cols = (columnasSeleccionadas.length > 0 ? columnasSeleccionadas : Object.keys(resultadosFiltrados[0] || {}))
      .filter(cId => colMap[cId]?.tipo === "number");
    return cols.map(cId => {
      const vals = resultadosFiltrados.map(r => parseFloat(r[cId])).filter(v => !isNaN(v));
      if (vals.length === 0) return { col: cId, count: 0 };
      const sum = vals.reduce((s, v) => s + v, 0);
      return {
        col: cId,
        count: vals.length,
        sum,
        avg: sum / vals.length,
        min: Math.min(...vals),
        max: Math.max(...vals),
      };
    });
  })();

  // Agrupación: cuenta + suma de numéricos por categoría
  const agrupado = (() => {
    if (!agruparPor || !resultadosFiltrados || resultadosFiltrados.length === 0) return null;
    const grupos = {};
    const colsNum = (columnasSeleccionadas.length > 0 ? columnasSeleccionadas : Object.keys(resultadosFiltrados[0] || {}))
      .filter(cId => colMap[cId]?.tipo === "number" && cId !== agruparPor);
    resultadosFiltrados.forEach(r => {
      const k = r[agruparPor] ?? "(vacío)";
      const key = String(k);
      if (!grupos[key]) {
        grupos[key] = { categoria: key, count: 0 };
        colsNum.forEach(c => { grupos[key]["sum_" + c] = 0; });
      }
      grupos[key].count += 1;
      colsNum.forEach(c => {
        const v = parseFloat(r[c]);
        if (!isNaN(v)) grupos[key]["sum_" + c] += v;
      });
    });
    const arr = Object.values(grupos).sort((a, b) => b.count - a.count);
    return { rows: arr, colsNum };
  })();

  const toggleColumna = (id) => {
    setColumnasSeleccionadas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const agregarFiltro = () => {
    setFiltros(prev => [...prev, { col: colDef.columnas[0].id, op: "eq", val: "" }]);
  };
  const quitarFiltro = (idx) => setFiltros(prev => prev.filter((_, i) => i !== idx));
  const updateFiltro = (idx, patch) => setFiltros(prev => prev.map((f, i) => i === idx ? { ...f, ...patch } : f));

  const ejecutar = async () => {
    setLoading(true); setError(""); setResultados(null);
    try {
      const cols = columnasSeleccionadas.length > 0 ? columnasSeleccionadas.join(",") : "*";
      // Paginación por keyset si la tabla tiene `id`. Si no, offset.
      const tieneId = colDef.columnas.some(c => c.id === "id");
      const all = [];
      const pageSize = 1000;
      let cursor = null;
      while (all.length < limite) {
        const restante = limite - all.length;
        const take = Math.min(pageSize, restante);
        let q = supabase.from(tabla).select(cols).order(orderBy, { ascending: orderDir === "asc" }).limit(take);
        // Aplicar filtros
        for (const f of filtros) {
          if (!f.col) continue;
          const colDefF = colMap[f.col];
          let v = f.val;
          if (colDefF?.tipo === "number" && f.op !== "is_null" && f.op !== "not_null") v = parseFloat(v);
          if (colDefF?.tipo === "boolean") v = String(f.val).toLowerCase() === "true";
          if (f.op === "is_null") q = q.is(f.col, null);
          else if (f.op === "not_null") q = q.not(f.col, "is", null);
          else if (f.op === "ilike") q = q.ilike(f.col, "%" + (f.val || "") + "%");
          else if (["eq","neq","gt","gte","lt","lte"].includes(f.op)) q = q[f.op](f.col, v);
        }
        // Keyset paginación si ordenamos por id desc
        if (tieneId && orderBy === "id" && orderDir === "desc" && cursor !== null) {
          q = q.lt("id", cursor);
        }
        const { data, error: qErr } = await q;
        if (qErr) throw qErr;
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < take) break;
        if (tieneId && orderBy === "id" && orderDir === "desc") {
          cursor = data[data.length - 1].id;
        } else {
          break; // sin keyset confiable, parar después de la primera página
        }
      }
      setResultados(all);
    } catch (e) {
      setError(e.message || String(e));
    }
    setLoading(false);
  };

  const exportarCSV = () => {
    if (!resultados || resultados.length === 0) return;
    const cols = columnasSeleccionadas.length > 0 ? columnasSeleccionadas : Object.keys(resultados[0]);
    const rowToCsv = (vals) => vals.map(v => {
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(",");
    const header = rowToCsv(cols.map(c => colMap[c]?.label || c));
    const lines = resultados.map(r => rowToCsv(cols.map(c => r[c])));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consulta_${tabla}_${new Date().toISOString().substring(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:24, fontWeight:800, margin:0 }}>Consultas</h1>
        <p style={{ color:C.textMuted, fontSize:13, marginTop:2 }}>Consulta visual sobre cualquier tabla — sin SQL. Selecciona columnas, agrega filtros y ejecuta.</p>
      </div>

      {/* Selector de tabla */}
      <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, padding:16, marginBottom:14 }}>
        <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Tabla</label>
        <select value={tabla} onChange={e => cambiarTabla(e.target.value)}
          style={{ padding:"9px 12px", borderRadius:8, border:"1px solid "+C.accent, fontSize:14, fontWeight:700, color:C.text, backgroundColor:C.white, minWidth:300 }}>
          {Object.entries(TABLAS).map(([id, t]) => <option key={id} value={id}>{t.label}</option>)}
        </select>
      </div>

      {/* Columnas */}
      <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, padding:16, marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em" }}>
            Columnas a mostrar ({columnasSeleccionadas.length}/{colDef.columnas.length})
          </label>
          <div style={{ display:"flex", gap:8 }}>
            <button type="button" onClick={() => setColumnasSeleccionadas(colDef.columnas.map(c => c.id))}
              style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontSize:11, fontWeight:700, color:C.accent, textDecoration:"underline" }}>Todas</button>
            <button type="button" onClick={() => setColumnasSeleccionadas([])}
              style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontSize:11, fontWeight:700, color:C.textMuted, textDecoration:"underline" }}>Ninguna</button>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:6 }}>
          {colDef.columnas.map(c => {
            const sel = columnasSeleccionadas.includes(c.id);
            return (
              <label key={c.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px", borderRadius:6, backgroundColor:sel?C.accentLight:C.bg, border:"1px solid "+(sel?C.accent:C.border), cursor:"pointer", fontSize:12 }}>
                <input type="checkbox" checked={sel} onChange={() => toggleColumna(c.id)} style={{ width:14, height:14, cursor:"pointer" }} />
                <span style={{ fontWeight:600, color:sel?C.accent:C.text }}>{c.label}</span>
                <span style={{ marginLeft:"auto", fontSize:9, color:C.textMuted, textTransform:"uppercase" }}>{c.tipo}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, padding:16, marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em" }}>Filtros ({filtros.length})</label>
          <button type="button" onClick={agregarFiltro}
            style={{ padding:"5px 12px", borderRadius:6, border:"1px dashed "+C.accent, backgroundColor:"transparent", color:C.accent, fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
            <IC.Plus /> Agregar filtro
          </button>
        </div>
        {filtros.length === 0 && <div style={{ fontSize:12, color:C.textMuted, fontStyle:"italic" }}>Sin filtros — la consulta devolverá todas las filas (hasta el límite).</div>}
        {filtros.map((f, i) => {
          const cd = colMap[f.col];
          const ops = OPERADORES_FILTRO[cd?.tipo || "text"] || OPERADORES_FILTRO.text;
          const sinValor = f.op === "is_null" || f.op === "not_null";
          return (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center", marginTop:8, padding:"8px 10px", backgroundColor:C.bg, borderRadius:6 }}>
              <select value={f.col} onChange={e => updateFiltro(i, { col: e.target.value, op: "eq", val: "" })}
                style={{ padding:"6px 8px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, minWidth:160 }}>
                {colDef.columnas.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <select value={f.op} onChange={e => updateFiltro(i, { op: e.target.value })}
                style={{ padding:"6px 8px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, minWidth:130 }}>
                {ops.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              {!sinValor && (
                cd?.tipo === "boolean" ? (
                  <select value={f.val} onChange={e => updateFiltro(i, { val: e.target.value })}
                    style={{ padding:"6px 8px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, flex:1 }}>
                    <option value="true">Verdadero</option>
                    <option value="false">Falso</option>
                  </select>
                ) : (
                  <input type={cd?.tipo === "date" ? "date" : (cd?.tipo === "number" ? "number" : "text")}
                    value={f.val} onChange={e => updateFiltro(i, { val: e.target.value })}
                    placeholder="Valor"
                    style={{ padding:"6px 8px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, flex:1, boxSizing:"border-box" }} />
                )
              )}
              <button onClick={() => quitarFiltro(i)} style={{ padding:4, border:"none", backgroundColor:C.redBg, color:C.red, borderRadius:4, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><IC.X /></button>
            </div>
          );
        })}
      </div>

      {/* Orden + límite + ejecutar */}
      <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:14, padding:"10px 14px", backgroundColor:C.white, borderRadius:10, border:"1px solid "+C.border }}>
        <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase" }}>Ordenar por</label>
        <select value={orderBy} onChange={e => setOrderBy(e.target.value)}
          style={{ padding:"6px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, fontWeight:600 }}>
          {colDef.columnas.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={orderDir} onChange={e => setOrderDir(e.target.value)}
          style={{ padding:"6px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, fontWeight:600 }}>
          <option value="desc">↓ Descendente</option>
          <option value="asc">↑ Ascendente</option>
        </select>
        <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", marginLeft:14 }}>Límite</label>
        <input type="number" min="1" max="50000" value={limite} onChange={e => setLimite(Math.max(1, Math.min(50000, parseInt(e.target.value)||1)))}
          style={{ padding:"6px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, width:90, textAlign:"center", fontWeight:700 }} />
        <div style={{ flex:1 }} />
        <button onClick={ejecutar} disabled={loading || columnasSeleccionadas.length === 0}
          style={{ padding:"9px 22px", borderRadius:8, border:"none", backgroundColor:loading||columnasSeleccionadas.length===0?C.textMuted:C.accent, color:"white", fontSize:13, fontWeight:700, cursor:loading||columnasSeleccionadas.length===0?"not-allowed":"pointer" }}>
          {loading ? "Ejecutando..." : "▶ Ejecutar consulta"}
        </button>
      </div>

      {/* Resultados */}
      {error && (
        <div style={{ padding:14, backgroundColor:C.redBg, color:C.red, borderRadius:8, border:"1px solid "+C.red, marginBottom:14, fontSize:13, fontWeight:600 }}>
          Error: {error}
        </div>
      )}
      {resultados !== null && (
        <>
          {/* Estadísticas de columnas numéricas */}
          {stats.length > 0 && (
            <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, marginBottom:14, overflow:"hidden" }}>
              <div style={{ padding:"10px 16px", borderBottom:"1px solid "+C.border, fontSize:12, fontWeight:700, color:C.text }}>
                Estadísticas de columnas numéricas
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ backgroundColor:C.bg }}>
                      {["Columna","N","Suma","Promedio","Mín","Máx"].map(h => (
                        <th key={h} style={{ padding:"7px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", borderBottom:"1px solid "+C.border }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map(s => (
                      <tr key={s.col} style={{ borderBottom:"1px solid "+C.border }}>
                        <td style={{ padding:"8px 12px", fontWeight:700, color:C.text }}>{colMap[s.col]?.label || s.col}</td>
                        <td style={{ padding:"8px 12px", color:C.text }}>{s.count.toLocaleString()}</td>
                        <td style={{ padding:"8px 12px", color:C.green, fontWeight:600 }}>{s.count > 0 ? s.sum.toLocaleString(undefined,{maximumFractionDigits:2}) : "—"}</td>
                        <td style={{ padding:"8px 12px", color:C.accent, fontWeight:600 }}>{s.count > 0 ? s.avg.toLocaleString(undefined,{maximumFractionDigits:2}) : "—"}</td>
                        <td style={{ padding:"8px 12px", color:C.text }}>{s.count > 0 ? s.min.toLocaleString() : "—"}</td>
                        <td style={{ padding:"8px 12px", color:C.text }}>{s.count > 0 ? s.max.toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Selector de agrupación */}
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", marginBottom:14, backgroundColor:C.white, borderRadius:10, border:"1px solid "+C.border, flexWrap:"wrap" }}>
            <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase" }}>Agrupar por</label>
            <select value={agruparPor} onChange={e => setAgruparPor(e.target.value)}
              style={{ padding:"6px 10px", borderRadius:6, border:"1px solid "+(agruparPor?C.accent:C.border), fontSize:12, fontWeight:600, backgroundColor:agruparPor?C.accentLight:C.white, color:agruparPor?C.accent:C.text }}>
              <option value="">— Sin agrupación —</option>
              {colDef.columnas.filter(c => c.tipo !== "number").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <div style={{ flex:1 }} />
            <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase" }}>Buscar en resultados</label>
            <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="texto..."
              style={{ padding:"6px 10px", borderRadius:6, border:"1px solid "+C.border, fontSize:12, minWidth:200 }} />
          </div>

          {/* Resultados — tabla agrupada o detalle */}
          <div style={{ backgroundColor:C.white, borderRadius:12, border:"1px solid "+C.border, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>
                {agrupado
                  ? `${agrupado.rows.length} grupo(s) — ${resultadosFiltrados.length.toLocaleString()} fila(s) en total`
                  : `${resultadosFiltrados.length.toLocaleString()} fila(s)${busqueda ? ` (filtradas de ${resultados.length.toLocaleString()})` : ""}`}
              </div>
              <button onClick={exportarCSV} disabled={resultadosFiltrados.length === 0}
                style={{ padding:"7px 16px", borderRadius:6, border:"1px solid "+C.green, backgroundColor:C.greenBg, color:C.green, fontSize:12, fontWeight:700, cursor:resultadosFiltrados.length===0?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:6 }}>
                <IC.Download /> Exportar CSV
              </button>
            </div>
            {resultadosFiltrados.length === 0 ? (
              <div style={{ padding:40, textAlign:"center", color:C.textMuted, fontSize:13 }}>No hay resultados con los filtros aplicados.</div>
            ) : agrupado ? (
              <div style={{ overflowX:"auto", maxHeight:500, overflowY:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead style={{ position:"sticky", top:0, backgroundColor:C.bg, zIndex:1 }}>
                    <tr>
                      <th style={{ padding:"8px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", borderBottom:"1px solid "+C.border }}>{colMap[agruparPor]?.label || agruparPor}</th>
                      <th style={{ padding:"8px 12px", textAlign:"right", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", borderBottom:"1px solid "+C.border }}>Conteo</th>
                      {agrupado.colsNum.map(c => (
                        <th key={c} style={{ padding:"8px 12px", textAlign:"right", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", borderBottom:"1px solid "+C.border }}>Σ {colMap[c]?.label || c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agrupado.rows.map((g, gi) => (
                      <tr key={gi} style={{ borderBottom:"1px solid "+C.border }}>
                        <td style={{ padding:"8px 12px", fontWeight:600, color:C.text }}>{g.categoria}</td>
                        <td style={{ padding:"8px 12px", textAlign:"right", color:C.accent, fontWeight:700 }}>{g.count.toLocaleString()}</td>
                        {agrupado.colsNum.map(c => (
                          <td key={c} style={{ padding:"8px 12px", textAlign:"right", color:C.green, fontWeight:600 }}>{g["sum_"+c].toLocaleString(undefined,{maximumFractionDigits:2})}</td>
                        ))}
                      </tr>
                    ))}
                    <tr style={{ backgroundColor:"#FAFBFF", borderTop:"2px solid "+C.text }}>
                      <td style={{ padding:"10px 12px", fontWeight:800, color:C.text }}>TOTAL</td>
                      <td style={{ padding:"10px 12px", textAlign:"right", fontWeight:800, color:C.accent }}>{agrupado.rows.reduce((s,g)=>s+g.count,0).toLocaleString()}</td>
                      {agrupado.colsNum.map(c => (
                        <td key={c} style={{ padding:"10px 12px", textAlign:"right", fontWeight:800, color:C.green }}>{agrupado.rows.reduce((s,g)=>s+(g["sum_"+c]||0),0).toLocaleString(undefined,{maximumFractionDigits:2})}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ overflowX:"auto", maxHeight:600, overflowY:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead style={{ position:"sticky", top:0, backgroundColor:C.bg, zIndex:1 }}>
                    <tr>
                      {(columnasSeleccionadas.length > 0 ? columnasSeleccionadas : Object.keys(resultadosFiltrados[0])).map(cId => (
                        <th key={cId} style={{ padding:"8px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", borderBottom:"1px solid "+C.border, whiteSpace:"nowrap" }}>{colMap[cId]?.label || cId}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultadosFiltrados.map((row, ri) => (
                      <tr key={ri} style={{ borderBottom:"1px solid "+C.border }}>
                        {(columnasSeleccionadas.length > 0 ? columnasSeleccionadas : Object.keys(row)).map(cId => {
                          const v = row[cId];
                          return (
                            <td key={cId} style={{ padding:"8px 12px", color:C.text, whiteSpace:"nowrap", maxWidth:280, overflow:"hidden", textOverflow:"ellipsis" }} title={v != null ? String(v) : ""}>
                              {v === null || v === undefined ? <span style={{color:C.textMuted}}>—</span> : (typeof v === "boolean" ? (v ? "✓" : "✗") : String(v))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
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
      case "asignaciones": return <ModuleAsignaciones />;
      case "manifiesto": return <ModuleManifiesto />;
      case "consultas": return <ModuleConsultas />;
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
        <div style={{ padding: sidebarCollapsed ? "16px 12px" : "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 58 }}>
          <img src="https://t1envios.com/assets/images/logos/T1Paginas.svg" alt="T1 Envíos" style={{ height: sidebarCollapsed ? 24 : 32, objectFit: "contain" }} />
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