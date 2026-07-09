-- ============================================================
-- KPIs FLOTILLA — índices + agregación server-side  (v2)
-- La tabla flotilla_ordenes tiene 174k+ filas. Sin esto, toda consulta por
-- fecha/estatus se cae por timeout (57014). Corre este SQL en el SQL Editor.
-- Es idempotente: puedes re-correrlo sin problema.
-- ============================================================

-- 1) Índices por fecha (entregas usan fecha_entrega; base para el rango)
create index if not exists flotilla_ordenes_fecha_entrega_idx on flotilla_ordenes (fecha_entrega);
create index if not exists flotilla_ordenes_fecha_promesa_idx on flotilla_ordenes (fecha_promesa);

-- 2) Índice PARCIAL para devoluciones (123): son pocas y NO tienen fecha_entrega,
--    así que se cuentan por fecha_promesa. Este índice solo indexa esas filas,
--    haciendo la rama de devoluciones instantánea.
create index if not exists flotilla_ordenes_devol_idx
  on flotilla_ordenes (fecha_promesa)
  where estatus like '123%' or estatus ilike '%devuel%' or estatus ilike '%devolu%';

-- 3) Agregación por día (server-side). Devuelve ~40 filas ya sumadas.
--    Rama A (entregas 360): día = fecha_entrega, usa el índice de fecha_entrega.
--    Rama B (devoluciones 123): día = fecha_promesa, usa el índice parcial.
--    NO usa OR entre columnas ni CROSS JOIN (eso forzaba seq scan → timeout).
create or replace function kpi_flotilla_por_dia(dias_ventana int default 40)
returns table(fecha date, e360 bigint, d123 bigint, ontime bigint)
language plpgsql
stable
as $$
declare
  v_cut timestamptz;
begin
  -- Sube el límite de tiempo por si el rango es grande (default anon es bajo).
  set local statement_timeout = '25s';

  select max(fecha_entrega) into v_cut from flotilla_ordenes;  -- rápido (índice)
  if v_cut is null then return; end if;
  v_cut := v_cut - make_interval(days => dias_ventana);

  return query
  with base as (
    -- Rama A: entregas (por fecha_entrega)
    select
      o.fecha_entrega::date as f,
      (o.estatus ilike '360%' or o.estatus ilike '%entregad%') as is360,
      false as is123,
      ((o.estatus ilike '360%' or o.estatus ilike '%entregad%')
        and o.fecha_promesa is not null
        and o.fecha_entrega::date <= o.fecha_promesa::date) as es_ontime
    from flotilla_ordenes o
    where o.fecha_entrega >= v_cut
    union all
    -- Rama B: devoluciones (por fecha_promesa, índice parcial)
    select
      o.fecha_promesa::date as f,
      false as is360,
      true as is123,
      false as es_ontime
    from flotilla_ordenes o
    where (o.estatus like '123%' or o.estatus ilike '%devuel%' or o.estatus ilike '%devolu%')
      and o.fecha_promesa >= v_cut
  )
  select b.f as fecha,
    count(*) filter (where b.is360)                 as e360,
    count(*) filter (where b.is123)                 as d123,
    count(*) filter (where b.is360 and b.es_ontime) as ontime
  from base b
  where b.f is not null
  group by b.f
  order by b.f desc;
end;
$$;
