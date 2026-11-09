// Listaa kaikki <täydennä>-kohdat sisällöstä. Julkaisun esto: aja `npm run tarkista:taydenna -- --strict`.
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "content");
const hits = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(md|json)$/.test(e.name)) {
      fs.readFileSync(p, "utf8").split("\n").forEach((line, i) => {
        const m = line.match(/(?:<|&lt;)täydennä[^>&]*(?:>|&gt;)/g);
        if (m) m.forEach((t) => hits.push(`${path.relative(process.cwd(), p)}:${i + 1}  ${t}`));
      });
    }
  }
})(root);
console.log(hits.length ? hits.join("\n") : "Ei <täydennä>-kohtia.");
console.log(`\nYhteensä ${hits.length} kohtaa.`);
if (hits.length && process.argv.includes("--strict")) process.exit(1);
