import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs}"],
    rules: {
      "no-unused-vars": "off",
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        AbortController: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        Response: "readonly",
        Headers: "readonly",
        process: "readonly",
        fetch: "readonly",
        console: "readonly",
        document: "readonly",
        window: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "node_modules/**"]),
]);
