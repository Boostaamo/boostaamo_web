// Listaa sisällön keskeneräiset <täydennä>-merkinnät. Aja ennen tuotantojulkaisua: npm run tarkista:taydenna
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const juuri = "content";
const loydot = [];
const kay = (d) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) kay(p);
    else if (/\.(md|json)$/.test(n)) {
      const s = readFileSync(p, "utf8");
      for (const m of s.matchAll(/(?:<|&lt;)täydennä:?([^<&]*)(?:>|&gt;)/g)) loydot.push(`${p}: ${m[1].trim() || "(tyhjä)"}`);
    }
  }
};
kay(juuri);
if (loydot.length) {
  console.log(`Keskeneräisiä merkintöjä ${loydot.length}:`);
  for (const l of loydot) console.log(`- ${l}`);
  process.exit(1);
}
console.log("Ei <täydennä>-merkintöjä.");
