// Regenera RUTEADOR-CODIGO.md a partir de las fuentes.
//
// El documento afirma que "se genera leyendo las fuentes": esto es lo que lo
// hace cierto. Correrlo después de cualquier cambio en el ruteador.
//
//   node scripts/docRuteador.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

const ARCHIVOS = [
  { ruta: "src/lib/ruteo.js", rol: "El algoritmo completo. Sin dependencias." },
  { ruta: "src/components/kmeansWorker.js", rol: "Web Worker: saca el cómputo del hilo principal." },
];

const fuentes = ARCHIVOS.map(a => {
  const txt = readFileSync(join(RAIZ, a.ruta), "utf8");
  return { ...a, txt, lineas: txt.replace(/\n$/, "").split("\n").length };
});

const doc = `# Ruteador — código fuente

Código completo del ruteador, tal como está en el repositorio. Sin recortes ni
reformateo: este archivo se genera leyendo las fuentes con
\`node scripts/docRuteador.mjs\`.

El algoritmo vive en **un solo archivo** a propósito. Antes existía una copia
dentro del Web Worker y otra en el camino inline de la interfaz, y divergían con
cada cambio.

La versión actual balancea por **horas de jornada**, no por número de paradas:
la duración medida de cada ruta regresa a la sectorización como objetivo de
tamaño. Todo lo que agrega la extensión v2 se activa por parámetros — con
\`PARAMS_DEFAULT\` el resultado es idéntico al del modelo original de la tesis, y
eso lo fija \`scripts/regresionRuteo.mjs\`.

Para la explicación del modelo, los parámetros, las métricas y las limitaciones
conocidas, ver [RUTEADOR.md](RUTEADOR.md).

| Archivo | Líneas | Rol |
|---|---:|---|
${fuentes.map(f => `| \`${f.ruta}\` | ${f.lineas} | ${f.rol} |`).join("\n")}

${fuentes.map(f => `---

## \`${f.ruta}\`

\`\`\`js
${f.txt.replace(/\n$/, "")}
\`\`\`
`).join("\n")}`;

writeFileSync(join(RAIZ, "RUTEADOR-CODIGO.md"), doc);
console.log("✓ RUTEADOR-CODIGO.md regenerado");
for (const f of fuentes) console.log(`  ${f.ruta} — ${f.lineas} líneas`);
