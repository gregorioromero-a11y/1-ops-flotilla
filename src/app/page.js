"use client";
import { useState, useEffect, useRef } from "react";
import LoginScreen from "../components/LoginScreen";
import T1OpsFlotilla from "../components/T1OpsFlotilla";

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutos sin actividad → logout

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const timerRef = useRef(null);

  // Cualquier carga / refresh de la página manda a login. NO se persiste
  // sesión entre recargas. Limpiamos el flag al montar por si quedó de antes.
  useEffect(() => {
    try { sessionStorage.removeItem("t1_auth"); } catch {}
  }, []);

  // Auto-logout por inactividad (60s sin mouse/teclado/scroll/touch)
  useEffect(() => {
    if (!authenticated) return;

    const logout = () => {
      sessionStorage.removeItem("t1_auth");
      setAuthenticated(false);
    };

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logout, INACTIVITY_MS);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // arranca el timer

    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [authenticated]);

  if (!authenticated) return <LoginScreen onLogin={() => setAuthenticated(true)} />;

  return <T1OpsFlotilla />;
}
