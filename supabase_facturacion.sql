-- ============================================================
-- MÓDULO FACTURACIÓN — tablas Supabase
-- Corre este SQL una vez en el SQL Editor de Supabase.
-- Cada carga se identifica por `periodo` (texto, ej. "2026-06" o "ABR-MAY").
-- Al re-subir un mismo periodo, el módulo borra ese periodo e inserta de nuevo.
-- ============================================================

-- 1) BASE DE DATOS (envíos) — con COSTO global calculado por el módulo
create table if not exists fact_envios (
  id            bigserial primary key,
  periodo       text not null,
  guia          text,
  pedido        text,
  id_unidad     text,
  tienda        text,
  empresa       text,
  proveedor     text,
  bucket        text,            -- proveedor canónico (ADET, CARRY, ...)
  fecha         text,
  estatus       text,
  valor_declarado numeric,
  costo         numeric,         -- COSTO global = total facturas flotilla propia / total envíos
  peso          numeric,
  seguro        numeric,
  precio_sin_iva  numeric,
  precio_total    numeric,       -- sin IVA, incluye seguro
  total_con_iva   numeric,
  alcaldia      text,
  raw           jsonb
);
create index if not exists fact_envios_periodo_idx  on fact_envios (periodo);
create index if not exists fact_envios_empresa_idx   on fact_envios (empresa);
create index if not exists fact_envios_bucket_idx    on fact_envios (bucket);

-- 2) BASE DE FACTURAS (Flotilla Propia / Mensajería / Seguridad)
create table if not exists fact_facturas (
  id              bigserial primary key,
  periodo         text not null,
  seccion         text,          -- FLOTILLA PROPIA | MENSAJERIA | SEGURIDAD
  proveedor_codigo text,
  razon_social    text,
  bucket          text,          -- proveedor canónico
  nar             text,
  no_factura      text,
  concepto        text,
  es_nc           boolean default false,  -- concepto = NOTA DE CREDITO
  subtotal        numeric,
  iva             numeric,
  ret_isr         numeric,
  importe_neto    numeric,
  raw             jsonb
);
create index if not exists fact_facturas_periodo_idx on fact_facturas (periodo);
create index if not exists fact_facturas_seccion_idx on fact_facturas (seccion);
create index if not exists fact_facturas_bucket_idx  on fact_facturas (bucket);

-- 3) BASE DE NC (notas de crédito a pagar al cliente)
create table if not exists fact_nc (
  id          bigserial primary key,
  periodo     text not null,
  guia        text,
  articulo    text,
  costo       numeric,
  id_tienda   text,
  empresa     text,
  proveedor   text,
  motivo      text,
  raw         jsonb
);
create index if not exists fact_nc_periodo_idx on fact_nc (periodo);
create index if not exists fact_nc_empresa_idx on fact_nc (empresa);
