import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.tsx"],
    ignores: ["**/hooks/**", "app/api/**"],
    rules: {},
  },
  // Legacy (pre-v2) code keeps its pre-existing violations; new v2 code is held to the full rules.
  {
    files: [
      "Lib/adapters.ts", "Lib/circuitSvg.ts", "Lib/api_services/**", "Lib/hooks/**", "Lib/queryFunctions/**",
      "_Stores/**", "hooks/**", "components/*.tsx", "components/ui/**", "components/animations/**", "_Components/**",
      "app/api/**", "features/drivers-hub/**", "features/home/**", "features/race-analysis/**", "features/race-detail/**",
      "features/driver-record/**", "features/season-hub/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "styles/theme/**",
    "e2e/**",
    "playwright.config.ts",
    "playwright-report/**",
    "lighthouse/results/**",
    "Lib/api/v2/schema.d.ts",
  ]),
]);

export default eslintConfig;
