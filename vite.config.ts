import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" + outDir "docs" -> GitHub Pages can serve main:/docs directly
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "docs", emptyOutDir: true },
});
