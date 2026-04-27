"use client";
import { useState, useEffect, useRef } from "react";
import LoginScreen from "../components/LoginScreen";
import T1OpsFlotilla from "../components/T1OpsFlotilla";

const INACTIVITY_MS = 60 * 1000; // 60 segundos sin actividad → logout

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem("t1_auth") === "1") setAuthenticated(true);
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
