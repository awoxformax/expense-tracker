import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
globals: {
  console: "readonly",
  fetch: "readonly",
  process: "readonly",
  RequestInit: "readonly",
  Response: "readonly",
  it: "readonly",
  expect: "readonly",
  alert: "readonly",
  require: "readonly",
},

    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@typescript-eslint": tseslint,
    },
    rules: {
  "react/react-in-jsx-scope": "off",
  "react-refresh/only-export-components": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "no-unused-vars": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
