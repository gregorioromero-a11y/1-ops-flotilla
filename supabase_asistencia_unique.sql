-- ============================================================
-- OPCIONAL — Índice único: 1 registro por operador por día en `asistencia`
-- ============================================================
-- ⚠️ DESTRUCTIVO: borra ~169 filas duplicadas históricas (mismo día + mismo
--    operador, coincidencia exacta) para poder crear el índice único.
--    Esto CAMBIA montos históricos de la prefactura (abril–junio) a la baja,
--    porque hoy esos duplicados se están cobrando dos veces.
-- Excluye 'Registro manual' (placeholder que sí puede repetirse en el día).
-- Revisa el conteo con el paso 0 ANTES de correr los pasos 1 y 2.
-- ============================================================

-- 0) (Revisión) Ver los duplicados que se borrarían, sin borrar nada:
--    Descomenta para inspeccionar.
-- select fecha, nombre_operador, count(*) as veces
-- from asistencia
-- where nombre_operador <> 'Registro manual'
-- group by fecha, nombre_operador
-- having count(*) > 1
-- order by fecha, nombre_operador;

begin;

-- 1) Borra duplicados dejando el de MENOR id (el primer registro del día).
delete from asistencia a
using asistencia b
where a.nombre_operador <> 'Registro manual'
  and a.fecha = b.fecha
  and a.nombre_operador = b.nombre_operador
  and a.id > b.id;

-- 2) Índice único parcial: impide dos registros del mismo operador el mismo día.
create unique index if not exists asistencia_fecha_operador_uidx
  on asistencia (fecha, nombre_operador)
  where nombre_operador <> 'Registro manual';

commit;
