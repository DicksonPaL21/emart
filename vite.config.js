import { defineConfig } from "vite"
import preact from "@preact/preset-vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  base: "./",
  plugins: [preact(), tailwindcss()],
  build: {
    assetsDir: "assets",
    cssCodeSplit: true,
    modulePreload: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor"
        },
      },
    },
  },
})
