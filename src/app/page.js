"use client";
import { useState, useEffect } from "react";
import LoginScreen from "../components/LoginScreen";
import T1OpsFlotilla from "../components/T1OpsFlotilla";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("t1_auth") === "1") setAuthenticated(true);
  }, []);

  if (!authenticated) return <LoginScreen onLogin={() => setAuthenticated(true)} />;

  return <T1OpsFlotilla />;
}
