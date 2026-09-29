# Ruteador

Módulo de planeación de rutas de última milla. Toma un archivo de paradas con
coordenadas, las reparte en *k* rutas balanceadas y ordena las visitas de cada
una considerando que el tráfico de la CDMX cambia a lo largo del día.

Implementa el modelo formal de la tesis **"Ruteador dinámico para la logística de
última milla en la CDMX mediante clusterización dinámica y optimización de rutas
dependiente del tiempo"** (Romero Romero, UNAM, agosto 2026). Los comentarios del
código citan las ecuaciones de ese documento con la notación `(n)` y `§n.n`.

---

## 1. Dónde vive el código

| Archivo | Qué contiene |
|---|---|
| `src/lib/ruteo.js` | **El algoritmo completo.** Única fuente de verdad. 355 líneas, sin dependencias. |
| `src/components/kmeansWorker.js` | Web Worker. 22 líneas: recibe el mensaje, llama a `rutear()`, devuelve el resultado. |
| `src/components/T1OpsFlotilla.jsx` → `ModuleRuteo()` | Interfaz: carga de archivo, mapa, edición manual, persistencia, histórico. |

El algoritmo está en un solo archivo a propósito. Antes existía una copia dentro
del worker y otra en el camino inline, y divergían con cada cambio.

---

## 2. El modelo en dos módulos

El enfoque es **cluster-first, route-second**: primero se decide *qué paradas van
juntas*, después *en qué orden se visitan*. Resolver ambas cosas a la vez es un
problema mucho más caro y, con paradas que se agrupan geográficamente como en la
CDMX, no compensa.

### Módulo 1 — Power Diagram capacitado (`powerDiagramCapacitado`)

Reparte los puntos en *k* sectores **de tamaño acotado**. Un k-means normal no
sirve aquí: produce sectores de 8 y de 90 paradas, y ninguno de los dos es una
jornada de trabajo.

Un *power diagram* es un k-means donde cada centro carga un peso `w_c` que se
resta de la distancia:

```
sector(p) = argmin_c  ‖p − centro_c‖² − w_c
```

Subir `w_c` hace que el sector *c* atraiga más puntos; bajarlo, menos. El bucle
ajusta esos pesos hasta que todos los sectores caen dentro de `[m, M]` paradas.

Por iteración:

1. **Asignar** cada punto al centro más cercano, descontando pesos.
2. **Re-sembrar** sectores que se quedaron vacíos, tomando el punto más lejano
   del sector más grande. Sin esto, un sector vacío congela su centroide y nunca
   vuelve, así que *k* deja de cumplirse en silencio.
3. **Mover centroides** al promedio de sus puntos (paso de Lloyd).
4. **Corregir pesos**: `w_c += η · (n̄ − n_c)`, donde `n̄ = n/k`.

Termina cuando ningún sector queda fuera de `[m, M]`, o a las 300 iteraciones.
Si nunca converge, devuelve **la mejor asignación vista**, no la última.

Tres detalles que no son obvios:

- **η se escala a la geometría del dataset**: `η₀ = (área/k) / n̄ / 10`. Una
  constante fija sólo funciona para la extensión geográfica donde se calibró.
- **η se amortigua**: `η = η₀ / (1 + it/40)`. Sin amortiguamiento los tamaños
  oscilan alrededor del objetivo y no convergen nunca.
- **El criterio de paro es `m ≤ n_c ≤ M`**, no un tope de iteraciones. Con el
  tope fijo anterior el ajuste se cortaba *antes* de balancear: sobre datos
  reales dejaba sectores de 16 y de 61 con `[m,M] = [25,60]`.

La siembra inicial es **k-means++** con generador pseudoaleatorio de semilla fija
(`seed = 12345`), así que el mismo archivo produce el mismo plan.

### Módulo 2 — TD-VRP por sector (`ordenarSector`)

Ordena las visitas de **un** sector. Tres fases:

1. **Semilla por vecino más cercano**, arrancando **del depósito**. No del punto
   más cercano al centroide: el vehículo sale de un lugar concreto y esa primera
   arista cuenta.

2. **2-opt sobre distancia pura.** Invertir el segmento `[i..j]` sólo cambia dos
   aristas, así que el delta se evalúa en **O(1)**:

   ```
   Δ = d(prev, t[j]) + d(t[i], next) − d(prev, t[i]) − d(t[j], next)
   ```

   Evaluar el tour completo dentro del doble bucle costaba O(n³) por pasada —
   3.8 s en un sector de 200 paradas. Con el delta baja a milisegundos.

3. **Reparación temporal**, sólo si hace falta. Ver abajo.

> **El objetivo es distancia, no tiempo — y es deliberado.** La tesis lo justifica
> en §6.2: la distancia es invariante ante errores en la estimación de velocidad,
> el tiempo no. Anclar el objetivo en distancia hace que la calidad de la solución
> no dependa de qué tan bueno sea el dato de tráfico. El tiempo entra **sólo por
> la región factible**.

---

## 3. Tiempo dependiente de la hora (`tiempoViaje`)

El corazón del modelo. Recorrer 10 km a las 8 de la mañana y a las 11 de la noche
no toma lo mismo, y una ruta de 9 horas cruza varias franjas de tráfico.

`V_CDMX` es un perfil de velocidad por hora del día, en km/h — 24 valores,
índice = hora:

| Hora | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| km/h | 38 | 40 | **42** | **42** | 40 | 34 | 24 | 15 | 11 | 12 | 16 | 19 |

| Hora | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| km/h | 20 | 19 | 18 | 16 | 13 | 10 | **9** | 11 | 17 | 24 | 31 | 35 |

Dos valles: el pico de la mañana toca fondo a las **08:00 (11 km/h)** y el de la
tarde, que es peor, a las **18:00 (9 km/h)**. El máximo son **42 km/h a las
02:00–03:00**. Entre el mejor y el peor momento del día hay un factor de 4.7×,
que es exactamente la razón por la que el orden de las visitas importa.

`tiempoViaje(t₀, d)` **consume la distancia franja por franja**, adoptando en cada
tramo la velocidad vigente. No usa `d / v(hora_de_salida)`.

Esa diferencia importa: la forma simplificada **viola la propiedad FIFO** —salir
antes puede implicar llegar después— en ~0.4% de los pares, con errores de hasta
40 minutos, y produce soluciones que premian esperar en el depósito, un artefacto
sin correlato operativo. Cuando el trayecto no cruza ningún límite de franja, las
dos expresiones dan exactamente lo mismo.

---

## 4. Parámetros

Editables desde la UI (panel **Parámetros del modelo**):

| Símbolo | Campo | Default | Qué es |
|---|---|---|---|
| `b₀` | Hora de salida | `8.0` | Hora decimal en que el vehículo deja el depósito |
| `T_max` | Jornada máxima | `9.0` h | Duración máxima de una ruta |
| `s_i` | Tiempo de servicio | `3` min | Tiempo parado en cada entrega |
| `m` | Paradas mínimas | `25` | Piso de tamaño de sector |
| `M` | Paradas máximas | `60` | Techo de tamaño de sector |
| `V` | Perfil de velocidad | `V_CDMX` | 24 valores, uno por hora |

**Depósito:** `19.398892731487283, -99.11677448852873` — constante `DEPOSITO`
en `T1OpsFlotilla.jsx`. Es un punto único y fijo; el modelo no contempla
múltiples orígenes.

---

## 5. Métricas (`metricas`)

Se calculan sobre el plan completo y se muestran junto al mapa:

| Métrica | Qué mide | Cómo leerla |
|---|---|---|
| **D** | Distancia total de todas las rutas, ancladas al depósito (ida y vuelta) | Menor es mejor |
| **CV** | Coeficiente de variación del tamaño de los sectores: `σ/μ` | **0 = todos iguales.** Es la medida de balanceo |
| **SLA %** | Porcentaje de rutas que caben en `T_max` | 100% = ninguna se pasa de jornada |
| **dur. máx** | La ruta más larga del plan | Si supera `T_max`, falta capacidad |
| **fuera de rango** | Sectores con menos de `m` o más de `M` paradas | Debería ser 0 |

**Si el SLA no llega a 100%, el problema no se arregla reordenando: se arregla
con más vehículos.** El ruteador lo reporta en vez de esconderlo.

---

## 6. Flujo de trabajo

```
Archivo (CSV/XLSX)
   │  columnas Latitud y Longitud obligatorias; el resto se conserva
   ▼
Generar rutas  ──►  Web Worker  ──►  Módulo 1 (sectores) ──► Módulo 2 (orden)
   │                                          │
   │                                          ▼
   │                                    D · CV · SLA
   ▼
Mapa interactivo (Leaflet + MarkerCluster)
   │
   ├─ editar a mano: dividir · fusionar · reasignar · excluir
   │
   ▼
Guardar ruteo  ──►  Supabase (tabla ruteo_puntos)
   │
   ▼
Asignaciones · Histórico · Exportar CSV/HTML
```

### Carga del archivo

Se lee con `xlsx` tanto para CSV como para Excel. La detección de columnas es
tolerante:

- **Latitud**: `lat` exacto → cualquier columna que contenga `latit` → `"Latitud"`
- **Longitud**: `lng`/`lon` exacto → contiene `longit` → `"Longitud"`
- **Guía**: contiene `tracking` → contiene `guia`/`guía`/`guide`

Se aceptan decimales con coma (`19,4` → `19.4`). Las filas sin coordenada válida
(lat o lng igual a 0) **se descartan en silencio** — conviene comparar el conteo
que reporta la UI contra el del archivo.

**Todas las demás columnas se conservan** y viajan hasta el CSV de salida y hasta
`datos_extra` en la base.

---

## 7. Persistencia

### Tabla `ruteo_puntos`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | bigserial | PK |
| `sesion` | text | `"S" + Date.now()` al guardar por primera vez |
| `indice` | int | Posición del punto en el archivo original |
| `latitud`, `longitud` | float | |
| `cluster` | int | Sector asignado. **`-1` = excluido** |
| `ruta` | text | `"Ruta N"` (cluster+1) o `"Excluido"` |
| `datos_extra` | text (JSON) | Todas las columnas del archivo salvo `lat`/`lng`/`_i` |
| `nombre` | text | Nombre opcional de la sesión |
| `created_at` | timestamptz | |

### La regla de oro de la escritura

`persistirClusters()` **verifica cuántas filas tocó realmente** y compara contra
las esperadas:

- **Tocar más filas de las pedidas es normal.** Una sesión puede tener puntos
  duplicados por índice, de un guardado previo cuyo borrado no se completó.
- **Tocar menos es un error.** Significa que hay puntos que la base no reconoció,
  y el plan quedaría partido entre lo que se ve y lo que está guardado.

Cuando la base rechaza una escritura, **la pantalla se revierte**. Una vista que
miente sobre lo guardado es peor que una operación que falla a la vista.

Este comportamiento existe por un bug real: dividir la Ruta 40 en dos mostraba 41
rutas en Ruteo, mientras Asignaciones —que lee de la base— seguía listando 40. La
ruta nueva "no se dejaba asignar" porque para la base nunca existió.

### Índice requerido

```sql
create index if not exists idx_ruteo_puntos_sesion on ruteo_puntos (sesion);
```

Seis escrituras filtran por `sesion`. Sin este índice hacen scan completo y
truenan por *statement timeout* (código `57014`) en cuanto la tabla crece. El
código detecta ese código de error y nombra el índice que falta en el mensaje.

Está en [`supabase_ruteo_asignaciones.sql`](supabase_ruteo_asignaciones.sql) junto
con el índice compuesto `(sesion, cluster)`.

---

## 8. Edición manual

Todas las operaciones escriben a la base inmediatamente y revierten la pantalla
si falla.

| Operación | Qué hace |
|---|---|
| **Reasignar** | Mueve los puntos seleccionados a otra ruta |
| **Excluir** | `cluster = -1`. No salen del almacén |
| **Reincluir** | Regresa puntos excluidos a una ruta |
| **Dividir** | Parte una ruta en *N* sub-rutas re-corriendo el algoritmo sobre ese subconjunto |
| **Fusionar** | Une dos rutas en una |

**Al dividir, la sub-ruta con más puntos conserva el número original.** Las demás
se anexan al final. Sin esta regla, dividir la Ruta 7 la hacía "desaparecer" de la
vista y aparecían dos rutas nuevas con números distintos.

La selección en el mapa tiene dos modos: **clic** por punto individual y **lazo**
para dibujar un polígono (point-in-polygon por ray casting). En modo lazo se
desactivan el arrastre y el zoom del mapa.

> Cualquier edición manual marca el plan como **editado a mano**: las métricas
> siguen siendo las del plan vigente, pero la secuencia ya no está re-optimizada.

---

## 9. Supuestos y limitaciones conocidas

Vale la pena tenerlos presentes antes de confiar en un número.

**El perfil de velocidad es un supuesto, no una medición.** `V_CDMX` está marcado
en el código como *"SUPUESTO A CALIBRAR con datos de tráfico del operador; es el
parámetro con mayor incertidumbre del modelo"*. Viene de §5.2 de la tesis, no de
la operación real. Es la primera cosa que conviene calibrar.

**Las distancias son en línea recta.** Todo usa haversine, no la red vial. En una
ciudad con ejes viales, camellones y sentidos únicos, la distancia real es
sistemáticamente mayor. Las rutas son comparables entre sí, pero la `D` absoluta
subestima los kilómetros que se van a recorrer.

**No hay ventanas de tiempo por cliente.** El modelo respeta la jornada total
`T_max`, no compromisos de entrega individuales.

**La capacidad se mide en número de paradas, no en peso ni volumen.** `[m, M]`
acota cuántas entregas caben, sin considerar si el vehículo físicamente las
carga.

**La reparación temporal es acotada a propósito.** Sólo se intenta cuando la ruta
excede `T_max` pero no pasa de `1.6 · T_max`. Más allá de ese umbral el sector
está sobrecargado para un vehículo y resecuenciar es trabajo perdido —además caro:
esa fase evalúa la duración completa dentro de un doble bucle, O(n³)—. Se deja
infactible y lo reporta el SLA.

**Un solo depósito, fijo.** No hay soporte para múltiples centros de distribución.

---

## 10. Rendimiento

- El cómputo corre en un **Web Worker**, así que la UI no se congela.
- El mapa usa **MarkerCluster** para poder renderizar 15 000+ puntos.
- La matriz de distancias se precalcula por sector en un `Float64Array`.
- El 2-opt usa delta O(1) (ver §2).
- Las inserciones a Supabase van en **lotes de 500 con concurrencia 5**; las
  actualizaciones en lotes de 100, porque `.in()` no acepta miles de elementos.
- `rutear()` devuelve `diagnostico.msComputo` con el tiempo de cómputo real.

Referencia observada en el código: convergencia del Módulo 1 en **28–75
iteraciones** para *k* entre 20 y 50.

---

## 11. Contrato de la API

```js
import { rutear, metricas, PARAMS_DEFAULT } from "./lib/ruteo.js";

const { assigns, seqOrder, metricas: m, diagnostico } = rutear(
  pts,      // [{ lat, lng, ...loQueSea }]
  k,        // número de rutas deseado
  depot,    // { lat, lng }
  params,   // parcial de PARAMS_DEFAULT
  onProgress // (fase, porcentaje) => void ; fase ∈ "clustering" | "tsp"
);
```

| Devuelve | Qué es |
|---|---|
| `assigns[i]` | Sector del punto `i`. Ids compactados a `0..k−1` sin huecos |
| `seqOrder[i]` | Posición del punto `i` dentro de su ruta |
| `metricas` | `{ D, CV, SLA, durMax, duraciones, fueraRango, minN, maxN, rutas }` |
| `diagnostico` | `{ iteracionesPD, fueraRango, tamaños, msComputo, k }` |

Las funciones intermedias (`haversine`, `proyectarKm`, `tiempoViaje`,
`distanciaRuta`, `duracionRuta`, `powerDiagramCapacitado`, `ordenarSector`) se
exportan por separado y son puras: se pueden probar sin montar React.

---

## 12. Sobre la proyección a kilómetros

`proyectarKm()` convierte lat/lng a un plano local en km antes de clusterizar.

Tratar grados como si fueran un plano euclidiano distorsiona los sectores: a la
latitud de la CDMX (~19.4°) un grado de longitud mide ~105 km y uno de latitud
~111 km, así que el eje x pesaría ~5% menos de lo que debe.

Clusterizar en kilómetros además hace que los pesos `w_c` tengan unidades físicas
y que `η` sea escalable a cualquier extensión geográfica — no sólo a la ciudad
donde se calibró.
