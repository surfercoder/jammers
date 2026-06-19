import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // We write a lot of marketing/UI copy — straight quotes are fine.
      "react/no-unescaped-entities": "off",
      // Closing a dialog / syncing embla state after an action is a legitimate
      // effect-driven sync; keep it as a hint, not a hard error.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated coverage reports.
    "coverage/**",
  ]),
]);

export default eslintConfig;
