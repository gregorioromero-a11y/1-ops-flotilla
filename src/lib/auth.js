// Roles y permisos (gating a nivel de UI). Hardcodeado: para agregar/editar
// usuarios o cambiar accesos, editar este archivo y redeployar.
// NOTA: esto oculta módulos según el rol; no es seguridad de datos (Supabase usa
// la llave anon en el cliente). Para seguridad real haría falta Supabase Auth + RLS.

// Qué módulos ve cada rol. "*" = todos. Ids deben coincidir con navSections.
export const ROLE_MODULES = {
  admin: "*",
  operaciones: [
    "dashboard", "kpis", "envios", "unidades", "operadores",
    "t1envios", "warehouse", "halfmile", "sameday",
    "ruteo", "asignaciones", "manifiesto", "consultas",
  ],
  costos: ["dashboard", "kpis", "costos", "carriers", "asignaciones", "consultas"],
  lectura: ["kpis"],
};

export const ROLE_LABELS = {
  admin: "Administrador",
  operaciones: "Operaciones",
  costos: "Costos",
  lectura: "Lectura",
};

// Usuarios. Cambia estas contraseñas por las reales.
export const USERS = [
  { user: "admin", pass: "almacen2026", nombre: "Administrador", role: "admin" },
  { user: "operaciones", pass: "ops2026", nombre: "Operaciones", role: "operaciones" },
  { user: "costos", pass: "costos2026", nombre: "Costos", role: "costos" },
  { user: "lectura", pass: "lectura2026", nombre: "Lectura", role: "lectura" },
];

// Devuelve { user, nombre, role } si las credenciales son válidas, o null.
export function authenticate(u, p) {
  const uNorm = String(u || "").trim().toLowerCase();
  const found = USERS.find((x) => x.user.toLowerCase() === uNorm && x.pass === p);
  return found ? { user: found.user, nombre: found.nombre, role: found.role } : null;
}

// ¿El rol puede ver este módulo?
export function canAccess(role, moduleId) {
  const mods = ROLE_MODULES[role];
  if (!mods) return false;
  return mods === "*" || mods.includes(moduleId);
}
