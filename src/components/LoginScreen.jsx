"use client";
import { useState } from "react";

const C = {
  bg: "#F8F9FC",
  accent: "#E63B2E",
  text: "#0C1425",
  textMuted: "#7C8495",
  white: "#FFFFFF",
  border: "#E2E6EE",
  red: "#DC2626",
  redBg: "#FEE2E2",
};

export default function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user === "admin" && pass === "almacen2026") {
      sessionStorage.setItem("t1_auth", "1");
      onLogin();
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: C.bg, fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <form onSubmit={handleSubmit} style={{ width: 360, backgroundColor: C.white, borderRadius: 16, padding: 40, boxShadow: "0 8px 32px rgba(0,0,0,0.10)", textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>
          <span style={{ color: C.accent }}>T1</span> <span style={{ color: C.text }}> ENVÍOS</span>
        </div>
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 32 }}>OPS Flotilla — Iniciar sesión</div>
        {error && <div style={{ fontSize: 13, color: C.red, backgroundColor: C.redBg, padding: "8px 12px", borderRadius: 8, marginBottom: 16 }}>{error}</div>}
        <div style={{ marginBottom: 16, textAlign: "left" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Usuario</label>
          <input value={user} onChange={e => setUser(e.target.value)} placeholder="Usuario" style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1.5px solid " + C.border, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 24, textAlign: "left" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Contraseña</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Contraseña" style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1.5px solid " + C.border, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <button type="submit" style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", backgroundColor: C.accent, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}
