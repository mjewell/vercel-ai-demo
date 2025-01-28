import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "import/no-duplicates": "error",
      "sort-imports": [
        "warn",
        {
          // the import/order rule is better and auto fixes so ignore here
          ignoreDeclarationSort: true,
        },
      ],
      // sorts imports across lines
      "import/order": [
        "warn",
        {
          pathGroups: [
            {
              pattern: "@/**",
              group: "external",
            },
          ],
          alphabetize: {
            order: "asc",
          },
        },
      ],
    },
  },
];

export default eslintConfig;
