-- ============================================================
-- KPIs FLOTILLA — índices + agregación server-side
-- La tabla flotilla_ordenes creció a 174k+ filas SIN índices, por lo que
-- cualquier consulta con filtro/orden por fecha se cae por timeout (57014).
-- Corre este SQL UNA vez en el SQL Editor de Supabase.
-- ============================================================

-- 1) Índices (aceleran filtros por fecha y el orden por fecha de entrega)
create index if not exists flotilla_ordenes_fecha_entrega_idx on flotilla_ordenes (fecha_entrega);
create index if not exists flotilla_ordenes_fecha_promesa_idx on flotilla_ordenes (fecha_promesa);

-- 2) Agregación por día (server-side). Devuelve ~40 filas ya sumadas:
--    entregas (360), devoluciones (123) y entregas a tiempo (entrega <= promesa),
--    ancladas a la fecha de entrega más reciente con datos.
--    El día del evento = fecha_entrega (entregas) o fecha_entrega/promesa (devoluciones).
create or replace function kpi_flotilla_por_dia(dias_ventana int default 40)
returns table(fecha date, e360 bigint, d123 bigint, ontime bigint)
language sql stable as $$
  with anchor as (
    select max(fecha_entrega) as maxd from flotilla_ordenes
  ),
  base as (
    select
      case
        when (o.estatus ilike '360%' or o.estatus ilike '%entregad%')
          then o.fecha_entrega::date
        when (o.estatus ilike '123%' or o.estatus ilike '%devuel%' or o.estatus ilike '%devolu%')
          then coalesce(o.fecha_entrega, o.fecha_promesa)::date
      end as fecha,
      (o.estatus ilike '360%' or o.estatus ilike '%entregad%') as is360,
      (o.estatus ilike '123%' or o.estatus ilike '%devuel%' or o.estatus ilike '%devolu%') as is123,
      (o.fecha_entrega is not null and o.fecha_promesa is not null
        and o.fecha_entrega::date <= o.fecha_promesa::date) as es_ontime
    from flotilla_ordenes o, anchor a
    where o.fecha_entrega >= (a.maxd - make_interval(days => dias_ventana))
       or o.fecha_promesa  >= (a.maxd - make_interval(days => dias_ventana))
  )
  select b.fecha,
    count(*) filter (where b.is360)                    as e360,
    count(*) filter (where b.is123)                    as d123,
    count(*) filter (where b.is360 and b.es_ontime)    as ontime
  from base b
  where b.fecha is not null
  group by b.fecha
  order by b.fecha desc;
$$;
