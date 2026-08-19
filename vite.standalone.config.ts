import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Config só pra gerar um único .html autocontido (JS/CSS inline), pra abrir
// direto no navegador via duplo clique (file://) sem precisar de servidor.
// Não é o build de produção normal — esse continua em vite.config.ts.
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "dist-standalone",
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
  },
});
