import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.jsx"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  globalIgnores([
    ".agents/**", ".next/**", ".next-build/**", ".npm-cache/**",
    "dist/**", "bower_components/**", "js/**", "src/app/**", "src/main.jsx",
    "vite.config.js",
  ]),
])
