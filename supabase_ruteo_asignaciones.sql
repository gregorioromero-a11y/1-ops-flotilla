-- ============================================================
-- RUTEO / ASIGNACIONES — índice faltante + municipios por operador
-- Corre este SQL en el SQL Editor de Supabase. Es idempotente.
-- ============================================================

-- 1) EL ÍNDICE QUE FALTA. `ruteo_puntos.sesion` se usa como filtro en todas las
--    escrituras del ruteo (dividir, fusionar, reasignar, excluir, borrar) y no
--    está indexado. Sin él, esas consultas hacen scan completo de la tabla y
--    truenan por statement timeout (57014) en cuanto la tabla crece.
--
--    El síntoma no se ve donde ocurre: dividías la Ruta 40 en dos, Ruteo
--    mostraba 41 porque el cambio vivía en pantalla, y Asignaciones —que lee de
--    la base— seguía listando 40. La ruta nueva "no se dejaba asignar" porque
--    para la base nunca existió.
--
--    El código ahora verifica cada escritura y avisa en vez de fallar en
--    silencio, pero eso convierte el problema en un error visible: la cura de
--    fondo es este índice.
create index if not exists idx_ruteo_puntos_sesion on ruteo_puntos (sesion);

-- Acelera además el agrupado por ruta dentro de una sesión.
create index if not exists idx_ruteo_puntos_sesion_cluster on ruteo_puntos (sesion, cluster);

-- 2) Tabla de asignaciones, por si aún no existe. La restricción única es lo que
--    permite re-guardar una sesión sin duplicar filas.
create table if not exists asignaciones_sesion (
  id bigserial primary key,
  sesion text not null,
  ruta_nombre text not null,
  proveedor text,
  tipo_unidad text,
  unidades int,
  no_asignar boolean default false,
  created_at timestamptz default now(),
  unique (sesion, ruta_nombre)
);
create index if not exists idx_asignaciones_sesion on asignaciones_sesion (sesion);

-- 3) MUNICIPIOS QUE CONOCE CADA OPERADOR. Se guarda como arreglo de texto con
--    los nombres tal como los publica INEGI (los mismos que usa el mapa del
--    Dashboard y el municipio calculado por ruta), para que el empate entre
--    "municipio de la ruta" y "municipios del operador" sea exacto y no dependa
--    de cómo se haya escrito el nombre a mano.
alter table operadores add column if not exists municipios text[] default '{}';

-- Índice GIN: permite preguntar "qué operadores conocen X" sin recorrer la
-- tabla. Hoy son pocos operadores y no hace falta, pero el costo es nulo y
-- evita tener que volver aquí cuando crezcan.
create index if not exists idx_operadores_municipios on operadores using gin (municipios);
