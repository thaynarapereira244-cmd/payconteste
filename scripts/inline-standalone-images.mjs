// Pós-processamento do build standalone (vite-plugin-singlefile): inlina em
// base64 as imagens referenciadas por caminho de string em runtime
// (`partner.logo`, `testimonial.photo` etc. — vêm de `public/assets/...` e
// são strings simples, não `import`s, então o Rollup/singlefile nunca as vê
// e não as embute). Sem isso, o HTML standalone só funciona servido por
// HTTP; aberto via file:// (duplo clique), essas imagens quebram porque não
// há servidor pra resolver o caminho absoluto "/assets/...".
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "dist-standalone", "index.html");
const publicDir = path.join(root, "public");

const MIME = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml" };

let html = readFileSync(htmlPath, "utf8");
let count = 0;
let bytes = 0;

html = html.replace(/\/assets\/[a-zA-Z0-9/_.-]+\.(webp|png|jpe?g|svg)/g, (match) => {
  const filePath = path.join(publicDir, match);
  if (!existsSync(filePath)) {
    console.warn("  (não encontrado, mantido como está):", match);
    return match;
  }
  const ext = path.extname(filePath).toLowerCase();
  const data = readFileSync(filePath);
  bytes += data.length;
  count++;
  return `data:${MIME[ext]};base64,${data.toString("base64")}`;
});

writeFileSync(htmlPath, html);
console.log(`Inlined ${count} images (${(bytes / 1024).toFixed(0)}KB source) into ${path.relative(root, htmlPath)}`);
