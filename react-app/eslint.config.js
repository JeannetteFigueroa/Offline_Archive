import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  //  se generan automáticamente las carpetas
  globalIgnores([
    "dist",
    "coverage"
  ]),

  // Configuración general del proyecto React
  {
    files: ["**/*.{js,jsx}"],

    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],

    languageOptions: {
      globals: globals.browser,

      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  },

  // Variables disponibles netamente dentro de las pruebas
  {
    files: [
      "src/**/*.spec.js",
      "src/**/*.spec.jsx"
    ],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jasmine
      }
    }
  }
]);