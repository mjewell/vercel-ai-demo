import "@/lib/env/load";
import { env } from "@/lib/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
  out: "./drizzle",
  casing: "snake_case",
});
