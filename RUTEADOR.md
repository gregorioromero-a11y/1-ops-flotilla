# Ruteador

Módulo de planeación de rutas de última milla. Toma un archivo de paradas con
coordenadas, las reparte en *k* rutas balanceadas y ordena las visitas de cada
una considerando que el tráfico de la CDMX cambia a lo largo del día.

Implementa el modelo formal de la tesis **"Ruteador dinámico para la logística de
última milla en la CDMX mediante clusterización dinámica y optimización de rutas
dependiente del tiempo"** (Romero Romero, UNAM, agosto 2026). Los comentarios del
código citan las ecuaciones de ese documento con la notación `(n)` y `§n.n`.

Sobre ese modelo hay una **extensión v2** que balancea por **horas de jornada** en
vez de por número de paradas (§2.1). Las ecuaciones `(22)`–`(26)` que aparecen en
el código numeran esa extensión siguiendo la convención de la tesis; no están en
el documento original.

> **Todo lo que agrega la v2 se activa por parámetros.** Con `PARAMS_DEFAULT` el
> resultado es idéntico punto por punto al del modelo de la tesis, y eso lo fija
> un test de regresión (§13). Quien no toque el panel de parámetros sigue
> obteniendo exactamente el plan de siempre.

---

## 1. Dónde vive el código

| Archivo | Qué contiene |
|---|---|
| `src/lib/ruteo.js` | **El algoritmo completo.** Única fuente de verdad. 954 líneas, sin dependencias. |
| `src/components/kmeansWorker.js` | Web Worker. 22 líneas: recibe el mensaje, llama a `rutear()`, devuelve el resultado. |
| `src/components/T1OpsFlotilla.jsx` → `ModuleRuteo()` | Interfaz: carga de archivo, mapa, edición manual, persistencia, histórico. |
| `scripts/` | Test de regresión, archivo de prueba, corrida de aceptación y generador de docs (§13). |

El algoritmo está en un solo archivo a propósito. Antes existía una copia dentro
del worker y otra en el camino inline, y divergían con cada cambio.

El código fuente completo, en markdown, está en
[RUTEADOR-CODIGO.md](RUTEADOR-CODIGO.md); se regenera con
`node scripts/docRuteador.mjs`.

---

## 2. El modelo en dos módulos

El enfoque es **cluster-first, route-second**: primero se decide *qué paradas van
juntas*, después *en qué orden se visitan*. Resolver ambas cosas a la vez es un
problema mucho más caro y, con paradas que se agrupan geográficamente como en la
CDMX, no compensa.

La v2 agrega un tercer módulo que **cierra el ciclo entre los dos** (§2.1).

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
4. **Corregir pesos**: `w_c += η · (n̄_c − n_c)`.

`n̄_c` es el **objetivo de tamaño del sector *c***. En el modelo de la tesis es el
mismo para todos (`n̄ = n/k`); la v2 lo vuelve un arreglo y es por ahí que el
Módulo 3 le dice a la sectorización *"este polígono tarda 8 horas, quítale
paradas"*.

Termina cuando ningún sector queda fuera de `[m, M]`, o a las 300 iteraciones.
Si nunca converge, devuelve **la mejor asignación vista**, no la última.

"Mejor" se mide por `(sectores fuera de ventana, desviación total al objetivo)`,
en ese orden. El segundo criterio existe porque el primero **se satura**: con una
ventana estrecha hay decenas de sectores fuera durante todo el ajuste y el conteo
no distingue *"fuera pero acercándose"* de *"fuera y lejos"*. La desviación sí es
continua, así que premia el progreso.

Junto con la asignación devuelve **los centros y los pesos que la produjeron** —no
los de la última iteración—. Eso es lo que permite continuar en caliente: si se
devolviera el estado final, reanudar movería un tercio de las paradas de sector
sin que nadie hubiera cambiado nada.

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

Ordena las visitas de **un** sector. Cuatro fases:

1. **Semilla por vecino más cercano**, arrancando **del depósito**. No del punto
   más cercano al centroide: el vehículo sale de un lugar concreto y esa primera
   arista cuenta.

   Con `inicios > 1` se prueban además las **hasta 10 paradas más lejanas al
   depósito** como primera visita (la primera arista sigue siendo depósito → esa
   parada). El vecino más cercano desde el depósito tiene un defecto conocido: se
   come las paradas cercanas primero y deja las lejanas sueltas, así que el último
   tramo es un regreso largo y caro. Arrancar por una lejana produce un barrido de
   ida y vuelta al que el 2-opt no llega desde la semilla golosa, porque ya está en
   un mínimo local.

2. **2-opt sobre distancia pura.** Invertir el segmento `[i..j]` sólo cambia dos
   aristas, así que el delta se evalúa en **O(1)**:

   ```
   Δ = d(prev, t[j]) + d(t[i], next) − d(prev, t[i]) − d(t[j], next)
   ```

   Evaluar el tour completo dentro del doble bucle costaba O(n³) por pasada —
   3.8 s en un sector de 200 paradas. Con el delta baja a milisegundos.

3. **Or-opt** (`orOpt`), alternado con el 2-opt hasta que ninguno mejore. Mueve
   segmentos de 1, 2 o 3 paradas consecutivas a cualquier otra posición, en los dos
   sentidos, también con delta O(1).

   Es el **complemento** del 2-opt, no un refinamiento: el 2-opt sólo *invierte*
   tramos, así que nunca saca una parada de donde está para meterla en otro lado
   del tour. El caso que aparece en todos los sectores reales es la parada aislada
   que quedó entre dos manzanas densas: el 2-opt la deja ahí porque cualquier
   inversión que la mueva alarga el tour, y el or-opt la reubica con un desvío de
   menos de la mitad.

4. **Reparación temporal**, sólo si hace falta. Ver §9.

> **Cada arranque se optimiza COMPLETO y se comparan tours terminados**, no
> semillas. Elegir por costo de la semilla —y optimizar sólo a la ganadora, que es
> lo que parece natural— **empeora el resultado**: sobre los 50 sectores del archivo
> de prueba daba 2 075 km contra 2 071 km del 2-opt a secas, porque la semilla más
> corta no es la que cae en el mejor mínimo local. Comparando resultados finales:
> **2 010 km, 48 de 50 sectores mejores, ninguno peor.**

> **El objetivo es distancia, no tiempo — y es deliberado.** La tesis lo justifica
> en §6.2: la distancia es invariante ante errores en la estimación de velocidad,
> el tiempo no. Anclar el objetivo en distancia hace que la calidad de la solución
> no dependa de qué tan bueno sea el dato de tráfico. El tiempo entra **sólo por
> la región factible**.

---

## 2.1 La extensión v2 — balancear horas, no paradas

La tesis balancea **cardinalidad**: `m ≤ n_j ≤ M` (9). En operación eso no reparte
el trabajo, porque **una parada de Santa Fe no cuesta lo que una del Centro**. Con
40 paradas parejas, medido sobre el archivo de prueba, las jornadas salen entre
**3.76 y 10.84 horas**: unos repartidores terminan a media tarde y otros no
alcanzan a cerrar.

Lo que iguala la v2 es `T^k`, la duración de la ruta.

### Agrupación por dirección (`agruparParadas`)

Antes de sectorizar, las guías que comparten **coordenada exacta** se colapsan en
una sola parada con `q` = número de guías. En el archivo de prueba **2 263 guías
son 2 010 domicilios**: un 11 % de paradas fantasma que pagaban estacionamiento y
caminata cinco veces donde el repartidor hace una sola bajada.

El tiempo de servicio pasa a ser `s_i = s₀ + (q_i − 1) · s₁`: la primera entrega
paga la maniobra completa, las demás del mismo domicilio sólo el intercambio.

La llave es el string de los dos números tal cual, **sin tolerancias**: "misma
dirección" aquí significa misma geocodificación. `assigns[i]` y `seqOrder[i]`
siguen indexados por **renglón del archivo**, así que todas las guías de un
domicilio reciben la misma ruta y la misma posición.

### Módulo 3 — el bucle de rebalanceo (`rutear`)

Sectorizar y secuenciar están acoplados: el tamaño del sector decide la duración,
pero la duración sólo se conoce **después** de secuenciar. La tesis corta el ciclo
fijando el tamaño como objetivo, que equivale a suponer que todas las paradas
cuestan lo mismo.

La v2 cierra el ciclo. En cada ronda:

1. Sectorizar con los objetivos `n̄_j` vigentes.
2. Secuenciar cada sector y **medir** `T_k` y `km_k` de verdad.
3. Parar si las jornadas están parejas —`max(T) − min(T) < ε`— y ninguna ruta pasa
   de `T_max` ni de `K_max`.
4. Si no, mover el objetivo de cada sector:

   ```
   n̄_j ← n_j · (T̄ / T_j)^α          (24)
   ```

   y multiplicar por `0.85` el de los sectores que violan `T_max` o `K_max`: ahí no
   basta con acercarse al promedio, hay que bajar del tope.
5. Reescalar los objetivos para que sumen `n`, redondear **por resto mayor**, y
   arrancar la ronda siguiente **en caliente** con los centros y pesos de la
   anterior.

`α = 0` apaga el lazo y recupera el modelo de la tesis. `α = 1` corrige de golpe
suponiendo que la duración es proporcional al número de paradas, lo que exagera
—hay un costo fijo de traslado que no se reparte— y hace oscilar los tamaños.
`α ≈ 0.7` corrige la mayor parte sin pasarse.

### Lo que resultó necesario para que el lazo cerrara

Tres cosas que no son evidentes en la formulación y sin las cuales el bucle
devuelve su propio resultado ronda tras ronda:

- **El criterio de paro de las rondas calientes es la desviación al objetivo, no la
  ventana `±δ`.** Con `fuera == 0` el balanceo rompe *antes* de tocar los pesos, así
  que si todos los sectores caen dentro de `±5 %` la sectorización es un no-op: un
  sector con objetivo 38 y 40 paradas se queda en 40, (24) recalcula 38 desde las 40
  medidas, y se repite para siempre. Se midió clavado en 5.36–6.90 h con la ronda 5
  saliendo en 4 iteraciones porque no había nada que ajustar.
- **La iteración 1 de una ronda caliente no puede ganar el récord.** Reproduce la
  ronda anterior por construcción; si se le permite ganar, la ronda devuelve lo que
  recibió.
- **`rutear()` entrega la mejor ronda vista, no la última.** Encadenar rondas
  *explora* —la dispersión puede subir en una ronda y bajar más en la siguiente— y
  quedarse con la mejor hace que una ronda mala no cueste nada.

### Lo que se gana, medido

Archivo de prueba, `k = 50`, agrupación activada, `s₀ = 6` min, `s₁ = 1` min,
`T_max = 11` h. Con `ρ = 1`, `γ = 1` y el perfil `V_CDMX`, para aislar el efecto
del lazo:

| | antes (`α=0, R_max=1`) | después (`α=0.7, R_max=10`) |
|---|---|---|
| **CV_T** (dispersión de jornadas) | 0.2320 | **0.0760** |
| Jornadas | 3.76 – 10.84 h | **5.59 – 8.41 h** |
| CV de paradas | 0.1736 | 0.1978 |
| D total | 2 011 km | 2 084 km |
| Cómputo | 0.2 s | 2.2 s |

**El CV de paradas sube y eso es el punto**: deja de igualar paquetes para igualar
horas. La distancia total sube ~3.6 % por la misma razón — un reparto parejo en
horas no es el más corto en kilómetros.

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

Todos editables desde la UI (panel **Parámetros del modelo**). Los defaults
reproducen el modelo de la tesis; la columna *operación* es la configuración con
que se calibró la v2.

### El interruptor v1 / v2

En **Paso 2** hay un botón de dos estados que escribe de golpe los 17 campos del
panel:

| | Qué configura |
|---|---|
| **v1 · modelo de la tesis** | Exactamente `PARAMS_DEFAULT`. Reparte por número de paradas, una sola pasada. |
| **v2 · balanceo por horas** | La configuración de operación: agrupación por domicilio, `γ=1.3`, `ρ=0`, `s₀=6`/`s₁=1` min, `K_max=120`, `α=0.7`, `R_max=10`, or-opt y 11 arranques. |

**No hay dos ruteadores.** El interruptor no cambia de código: escribe parámetros.
Después de elegir un modo se pueden seguir ajustando campos a mano, y en cuanto
alguno deja de coincidir el estado pasa a **personalizado** — hacía falta ese
tercer estado, porque un botón que se queda iluminado después de un ajuste manual
afirma que corre un modo que no corre.

Cambiar el modo **no re-rutea**: recalcula las métricas del plan vigente con los
parámetros nuevos, pero los sectores y el orden siguen siendo los de antes. La UI
lo advierte y hay que usar *Re-clusterizar*.

`node scripts/modosRuteo.mjs` verifica que el preset v1 siga siendo idéntico a
`PARAMS_DEFAULT` —viven en archivos distintos y pueden separarse— y corre los dos
modos lado a lado.

> **Los dos modos no son comparables en duración.** No difieren sólo en cómo
> balancean: v2 supone 6 min de servicio en vez de 3, jornada de 11 h en vez de 9 y
> circuidad 1.3. Sus jornadas salen *más largas* porque modela el trabajo más
> caro, no porque rutee peor. Para medir el efecto del balanceo con los supuestos
> fijos está `node scripts/benchRuteo.mjs`, que sólo mueve `α` y `R_max`.

### Jornada y servicio

| Símbolo | Campo | Default | Operación | Qué es |
|---|---|---|---|---|
| `b₀` | Hora de salida | `8.0` | `8.0` | Hora decimal en que el vehículo deja el depósito |
| `T_max` | Jornada máxima | `9.0` h | `11` h | Duración máxima de una ruta |
| `s₀` | Servicio, 1ª guía | `3` min | `6` min | Maniobra completa: estacionarse, caminar, entregar |
| `s₁` | Guía adicional | `0` min | `1` min | Cada guía extra del **mismo domicilio** |

`s₀` sustituye a `s_i`. El nombre viejo **`si` sigue funcionando** como alias con
prioridad, porque la simulación de flota lo usa para aislar el traslado puro.

### Geometría de la ruta

| Símbolo | Campo | Default | Operación | Qué es |
|---|---|---|---|---|
| `γ` | Circuidad | `1.0` | `1.3` | Multiplica toda distancia: red vial / línea recta |
| `ρ` | Retorno al CEDIS | `1` | `0` | `1` = el vehículo regresa; `0` = termina en la última entrega |
| `K_max` | Tope km por ruta | ∞ | `120` | Kilómetros máximos, traslado incluido |
| `V` | Perfil de velocidad | `V_CDMX` | 24 × `22` | 24 valores, uno por hora |

`γ` es un escalar, así que **no cambia qué secuencia es óptima** —el argmin de (3)
es el mismo— pero sí las horas y los kilómetros reportados, que es donde se compara
contra la realidad. El campo *velocidad constante* de la UI arma los 24 valores
iguales que reproducen un modelo sin dependencia horaria.

`ρ = 0` **rompe la simetría** de (7): ir al depósito y venir de él dejan de costar
lo mismo, y eso cambia por qué extremo de la zona conviene empezar. En el archivo
de prueba baja la distancia total de 2 071 a 1 576 km.

### Balanceo por horas (Módulo 3)

| Símbolo | Campo | Default | Operación | Qué es |
|---|---|---|---|---|
| `α` | Exponente de rebalanceo | `0` | `0.7` | `0` apaga el lazo por completo |
| `ε` | Tolerancia de jornadas | `0.6` h | `0.6` h | Diferencia aceptable entre la ruta más larga y la más corta |
| `R_max` | Rondas máximas | `1` | `10` | `1` = una sola pasada, como el modelo original |
| `δ` | Ventana de paradas | `0.05` | `0.05` | Ancho aceptable alrededor de `n̄_j`, como fracción |

> **`α > 0` con `R_max = 1` no hace nada** y la UI lo advierte: hace falta más de una
> ronda para que la duración medida regrese a la sectorización.

### Secuenciación y entrada

| Campo | Default | Operación | Qué es |
|---|---|---|---|
| Arranques del TSP (`inicios`) | `1` | `11` | `1` = sólo desde el depósito; hasta `11` con las 10 paradas más lejanas |
| Or-opt (`orOpt`) | apagado | encendido | Más lento, rutas más cortas |
| Agrupar por dirección (`agrupar`) | apagado | encendido | Colapsa guías con la misma coordenada |
| `m` / `M` | `25` / `60` | `25` / `60` | Piso y techo de tamaño de sector |

**Depósito:** `19.398892731487283, -99.11677448852873` — constante `DEPOSITO`
en `T1OpsFlotilla.jsx`. Es un punto único y fijo; el modelo no contempla
múltiples orígenes.

---

## 5. Métricas (`metricas`)

Se calculan sobre el plan completo y se muestran junto al mapa:

| Métrica | Qué mide | Cómo leerla |
|---|---|---|
| **D** | Distancia total de todas las rutas, ancladas al depósito | Menor es mejor |
| **CV** | Coeficiente de variación del **tamaño** de los sectores: `σ/μ` | 0 = todos llevan los mismos paquetes |
| **CV_T** | Coeficiente de variación de las **jornadas** | **0 = todos trabajan lo mismo.** Es lo que minimiza el Módulo 3 |
| **SLA %** | Rutas que caben en `T_max` **y** en `K_max` | 100 % = ninguna se pasa |
| **dur. máx** | La ruta más larga en horas | Si supera `T_max`, falta capacidad |
| **km máx** | La ruta más larga en kilómetros | Si supera `K_max`, falta capacidad |
| **fuera de rango** | Sectores con menos de `m` o más de `M` paradas | Debería ser 0 |

> **Cuando CV y CV_T no coinciden, el que importa es CV_T.** Un CV de 0.02 con un
> CV_T de 0.20 significa que todos llevan los mismos paquetes y unos salen tres
> horas antes que otros. Es exactamente el problema que motivó la v2.

**Si el SLA no llega a 100%, el problema no se arregla reordenando: se arregla
con más vehículos.** El ruteador lo reporta en vez de esconderlo.

### Salida por parada y por ruta

Además de las métricas agregadas, `rutear()` devuelve:

- **`eta[i]`** — hora estimada de llegada a cada renglón del archivo, en horas
  decimales, propagada con `tiempoViaje` desde `b₀`. Es lo que el repartidor
  necesita y lo que el cliente pregunta; sale de la misma función que calcula la
  duración, para que los dos números no se separen.
- **`rutasResumen`** — por ruta: paradas, guías, **km de zona**, **km de traslado**,
  km total, horas, última entrega y `cumple`.

Zona y traslado van separados porque son dos conversaciones distintas: el de zona
lo baja un mejor ruteo, el de traslado sólo lo baja mover el CEDIS o cambiar la
zona asignada.

`ultimaEntrega` es la **llegada más su servicio** —cuándo queda entregado el último
paquete—, no la llegada a secas ni el fin de jornada, que con `ρ = 1` incluye el
regreso. Con `ρ = 0` coincide con `b₀ + horas`.

Los dos se recalculan también después de cada **edición manual**, con las mismas
funciones del algoritmo (`etaRuta`, `resumenRuta`), así que lo que se exporta
siempre corresponde al plan vigente y no al generado.

---

## 6. Flujo de trabajo

```
Archivo (CSV/XLSX)
   │  columnas Latitud y Longitud obligatorias; el resto se conserva
   ▼
Agrupar por dirección (opcional)   2 263 guías ─► 2 010 paradas con q
   ▼
Generar rutas  ──►  Web Worker
   │
   │     ┌───────────── hasta R_max rondas ─────────────┐
   │     │                                             │
   └────►│  Módulo 1 (sectores con objetivo n̄_j)        │
         │         ▼                                   │
         │  Módulo 2 (orden: NN múltiple, 2-opt, or-opt)│
         │         ▼                                    │
         │  medir T_k y km_k ──► ¿parejas y en tope?    │
         │         │ no                                 │
         │         └── Módulo 3: n̄_j ← n_j·(T̄/T_j)^α ───┘
         ▼
   se entrega la MEJOR ronda ──► D · CV · CV_T · SLA · eta · rutasResumen
   ▼
Mapa interactivo (Leaflet + MarkerCluster)
   │
   ├─ editar a mano: dividir · fusionar · reasignar · excluir
   │     └─ métricas, eta y resumen se recalculan sobre el plan vigente
   ▼
Guardar ruteo  ──►  Supabase (tabla ruteo_puntos)
   │
   ▼
Asignaciones · Histórico · Exportar CSV/HTML
```

### Lo que sale en los exports

- **CSV** — una fila por guía con `Ruta`, `Parada` (1..n), `ETA` en `HH:MM` y todas
  las columnas originales, más un segundo bloque con el resumen por ruta.
- **HTML** — mapa autocontenido con la **polilínea de cada ruta en orden de visita**
  y un popup por ruta con su resumen, más una tabla de resumen que se lee sin abrir
  el mapa. El tramo de regreso se dibuja sólo si `ρ = 1`: con `ρ = 0` la jornada
  termina en la última entrega y pintarlo sería mentir sobre el plan.

Los marcadores sueltos dicen qué paquetes lleva cada unidad pero no en qué orden;
con el trazo se ve de un golpe si una ruta cruza media ciudad para volver sobre sus
pasos, que es el error que hay que detectar a ojo.

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

**Las distancias son en línea recta, corregidas por un factor.** Todo usa
haversine × `γ`. En una ciudad con ejes viales, camellones y sentidos únicos la
distancia real es mayor, y `γ = 1.3` absorbe *el promedio* de esa diferencia — no
su variación: un par de puntos separados por el Periférico y otro con calle directa
reciben el mismo factor. Sigue sin haber red vial.

**No hay ventanas de tiempo por cliente.** El modelo respeta la jornada total
`T_max`, no compromisos de entrega individuales. El `eta` por parada es
informativo: nadie lo usa como restricción.

**La capacidad se mide en paradas y en horas, no en peso ni volumen.** `[m, M]`
acota cuántas entregas caben y `T_max`/`K_max` cuánto se puede trabajar, sin
considerar si el vehículo físicamente carga los paquetes.

**El balanceo por horas tiene un piso.** El sistema sectorizar↔secuenciar tiene
óptimos locales: con la geografía fija y celdas convexas hay una dispersión que no
se baja moviendo cuentas de paradas. Sobre el archivo de prueba con `k = 50` el
bucle converge en 3 rondas a `CV_T ≈ 0.06` y de ahí no baja aunque se le den 10
rondas. Con `k = 47`, donde el promedio de jornada sube de 5.9 a 6.2 h y hay más
holgura, llega a `CV_T = 0.0301`. **La banda de duraciones depende de `k` contra el
trabajo total, no del balanceo**: si el promedio sale en 5.9 h, ninguna cantidad de
rebalanceo va a poner las jornadas en 6.0–6.8 h.

**La agrupación por dirección exige coordenada idéntica.** Dos geocodificaciones
del mismo domicilio que difieran en el quinto decimal cuentan como dos paradas. No
hay tolerancia a propósito —"misma dirección" significa una sola bajada— pero si el
geocodificador es inestable, el conteo de paradas lo refleja.

**El archivo de prueba es sintético.** `scripts/fixtures/guias-2263.json` reproduce
la escala real (2 263 guías → 2 010 domicilios) con demanda agrupada en 15 zonas de
la ZMVM, pero no es el archivo del operador. Todas las cifras de este documento
salen de él; sobre datos reales van a ser otras.

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
- La matriz de distancias se precalcula por sector en un `Float64Array`. Entre
  paradas es simétrica; los arcos con el depósito **no**, porque `ρ` pesa el
  regreso. La fila `DEP` guarda la ida y la columna `DEP` el regreso, así que
  `dd(a,b)` sigue siendo un solo lookup y el delta del 2-opt toma el costo correcto
  sin ramificar.
- El 2-opt y el or-opt usan delta O(1) (ver §2).
- La agrupación por dirección **reduce el trabajo**: 2 010 paradas en vez de 2 263
  guías son 11 % menos nodos en la matriz de cada sector.
- Las inserciones a Supabase van en **lotes de 500 con concurrencia 5**; las
  actualizaciones en lotes de 100, porque `.in()` no acepta miles de elementos.
- `rutear()` devuelve `diagnostico.msComputo`, `rondas`, `rondaElegida` e
  `historial` con `[min T, max T, max km, infactibles]` por ronda.

Medido sobre el archivo de prueba (2 263 guías, `k = 50`, configuración de
operación completa: agrupación, `ρ = 0`, `γ = 1.3`, or-opt y 11 arranques):

| | Tiempo |
|---|---|
| Ronda 1 (equivalente al modelo original) | 0.2 s |
| Bucle completo, 6 rondas hasta converger | **1.6 s** |
| Tope de aceptación | 90 s |

El costo del lazo es ~8× una pasada, y aun así queda dos órdenes de magnitud por
debajo del presupuesto. Convergencia del Módulo 1 en **18–224 iteraciones** por
ronda: la primera es rápida porque la ventana `[m, M]` es ancha, las calientes
persiguen el objetivo exacto.

El bucle **corta por estancamiento** a las 3 rondas sin mejora, no a la primera:
se midieron mesetas que vuelven a mejorar a la tercera ronda.

---

## 11. Contrato de la API

```js
import { rutear, metricas, PARAMS_DEFAULT } from "./lib/ruteo.js";

const { assigns, seqOrder, eta, rutasResumen, metricas: m, diagnostico } = rutear(
  pts,      // [{ lat, lng, ...loQueSea }]
  k,        // número de rutas deseado
  depot,    // { lat, lng }
  params,   // parcial de PARAMS_DEFAULT
  onProgress // (fase, pct) => void ; fase ∈ "clustering" | "tsp" | "rebalanceo"
);
```

| Devuelve | Qué es |
|---|---|
| `assigns[i]` | Sector del **renglón** `i`. Ids compactados a `0..k−1` sin huecos |
| `seqOrder[i]` | Posición del renglón `i` dentro de su ruta |
| `eta[i]` | Hora de llegada al renglón `i`, en horas decimales |
| `rutasResumen` | `[{ ruta, cluster, paradas, guias, kmZona, kmTraslado, kmTotal, horas, ultimaEntrega, cumple }]` |
| `metricas` | `{ D, CV, CV_T, SLA, durMax, kmMax, duraciones, kmPorRuta, fueraRango, minN, maxN, rutas }` |
| `diagnostico` | `{ iteracionesPD, fueraRango, tamaños, msComputo, k, guias, paradas, rondas, rondaElegida, historial }` |

Con agrupación, `assigns`, `seqOrder` y `eta` siguen teniendo **una entrada por
renglón del archivo**; las guías de un mismo domicilio comparten los tres valores.

Las funciones intermedias (`haversine`, `proyectarKm`, `tiempoViaje`,
`distanciaRuta`, `duracionRuta`, `powerDiagramCapacitado`, `ordenarSector`,
`agruparParadas`, `etaRuta`, `resumenRuta`) se exportan por separado y son puras:
se pueden probar sin montar React. La UI usa `etaRuta` y `resumenRuta` directamente
para recalcular el plan tras una edición manual, en vez de duplicar la lógica.

`powerDiagramCapacitado(pts, k, opts)` acepta `{ nbar, m, M, centros, w, it0,
delta, maxIt, seed, pararEnDesviacion, exigirMovimiento, paciencia, onProgress }`.
`m` y `M` aceptan **escalar o arreglo**: un escalar se expande a los `k` sectores,
que es el rango global `[m, M]` de la tesis.

---

## 12. Sobre la proyección a kilómetros

`proyectarKm()` convierte lat/lng a un plano local en km antes de clusterizar.

Tratar grados como si fueran un plano euclidiano distorsiona los sectores: a la
latitud de la CDMX (~19.4°) un grado de longitud mide ~105 km y uno de latitud
~111 km, así que el eje x pesaría ~5% menos de lo que debe.

Clusterizar en kilómetros además hace que los pesos `w_c` tengan unidades físicas
y que `η` sea escalable a cualquier extensión geográfica — no sólo a la ciudad
donde se calibró.

---

## 13. Pruebas

```bash
node scripts/regresionRuteo.mjs          # verifica contra el snapshot
node scripts/regresionRuteo.mjs --freeze # recongela (sólo a mano, con razón)
node scripts/benchRuteo.mjs [k]          # corrida de aceptación, k=50 por default
node scripts/fixtureRuteo.mjs            # regenera el archivo de prueba
node scripts/docRuteador.mjs             # regenera RUTEADOR-CODIGO.md
```

| Script | Qué hace |
|---|---|
| `regresionRuteo.mjs` | **Congela la salida con los parámetros por defecto** y la verifica: 7 llamadas completas a `rutear()` más las unidades (`tiempoViaje`, `distanciaRuta`, `duracionRuta`, `ordenarSector`, el balanceo). Es la red que permite meter la v2 sin romper lo que ya opera. |
| `benchRuteo.mjs` | Corre la configuración de operación y mide los criterios de aceptación uno por uno, más la comparación antes/después del rebalanceo. |
| `fixtureRuteo.mjs` | Genera el archivo de prueba, determinista con semilla fija. |
| `cargarRuteo.mjs` | Carga `ruteo.js` desde Node copiándolo a un `.mjs` temporal: el `package.json` de la app no declara `"type": "module"`, así que Node interpretaría el `.js` como CommonJS. No transforma nada — el test corre contra el código real. |

**El snapshot incluye un caso llamado `pronostico-si0`** que replica literalmente
cómo llama la simulación de flota, pasando el alias viejo `si` en vez de `s0`. Si
ese alias se rompe, la calibración del tiempo de servicio se iría en silencio al
valor por defecto y la simulación saldría optimista sin avisar a nadie.

> **`--freeze` sólo debe correrse contra un árbol verificado.** Si se recongela para
> "arreglar" un test que falla, el test deja de servir de algo.

No hay framework de pruebas en el proyecto: son scripts de Node sin dependencias,
que es lo que permite correrlos sin tocar `package.json`.
