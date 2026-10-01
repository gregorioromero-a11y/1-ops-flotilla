// Carga src/lib/ruteo.js desde Node.
//
// El package.json de la app no declara "type": "module" (es un proyecto Next),
// así que Node interpreta cualquier .js como CommonJS y el `import` de ruteo.js
// truena con "Cannot use import statement outside a module". La extensión .mjs
// SÍ fuerza ESM sin importar el package.json, así que se copia el archivo a un
// temporal .mjs y se importa desde ahí. No se transforma nada: es el mismo byte
// por byte, para que el test corra contra el código real y no contra una copia
// adaptada.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
export const RUTEO_JS = join(AQUI, "..", "src", "lib", "ruteo.js");

export async function cargarRuteo() {
  const src = readFileSync(RUTEO_JS, "utf8");
  const dir = mkdtempSync(join(tmpdir(), "ruteo-"));
  const dest = join(dir, "ruteo.mjs");
  writeFileSync(dest, src);
  return import(pathToFileURL(dest).href);
}
