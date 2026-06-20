// Roles y permisos (gating a nivel de UI). Hardcodeado: para agregar/editar
// usuarios o cambiar accesos, editar este archivo y redeployar.
// NOTA: esto oculta módulos según el rol; no es seguridad de datos (Supabase usa
// la llave anon en el cliente). Para seguridad real haría falta Supabase Auth + RLS.

// Interruptor global de roles/permisos. Mientras se desarrolla la plataforma se
// deja en false: TODOS los usuarios ven TODOS los módulos (acceso total).
// Al final del desarrollo, ponerlo en true para activar el gating por rol.
export const ROLES_ENABLED = false;

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
  kpis: ["kpis"],
};

export const ROLE_LABELS = {
  admin: "Administrador",
  operaciones: "Operaciones",
  costos: "Costos",
  lectura: "Lectura",
  kpis: "KPIs",
};

// Roles que SIEMPRE se restringen, aunque el gating global esté apagado en
// desarrollo (para tener usuarios acotados desde ya, p. ej. el de KPIs).
export const ROLES_SIEMPRE_RESTRINGIDOS = new Set(["kpis", "lectura"]);

// Usuarios. Cambia estas contraseñas por las reales.
export const USERS = [
  { user: "admin", pass: "almacen2026*", nombre: "Administrador", role: "admin" },
  { user: "operaciones", pass: "ops2026", nombre: "Operaciones", role: "operaciones" },
  { user: "costos", pass: "costos2026", nombre: "Costos", role: "costos" },
  { user: "lectura", pass: "lectura2026", nombre: "Lectura", role: "lectura" },
  { user: "kpis", pass: "kpis2026", nombre: "KPIs", role: "kpis" },
];

// Devuelve { user, nombre, role } si las credenciales son válidas, o null.
export function authenticate(u, p) {
  const uNorm = String(u || "").trim().toLowerCase();
  const found = USERS.find((x) => x.user.toLowerCase() === uNorm && x.pass === p);
  return found ? { user: found.user, nombre: found.nombre, role: found.role } : null;
}

// ¿El rol puede ver este módulo?
export function canAccess(role, moduleId) {
  // En desarrollo todos ven todo, EXCEPTO los roles siempre restringidos.
  if (!ROLES_ENABLED && !ROLES_SIEMPRE_RESTRINGIDOS.has(role)) return true;
  const mods = ROLE_MODULES[role];
  if (!mods) return false;
  return mods === "*" || mods.includes(moduleId);
}
