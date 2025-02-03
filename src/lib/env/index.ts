import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const stringToBoolean = (s: string) => s !== "false" && s !== "0";

export const env = createEnv({
  emptyStringAsUndefined: true,
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    TZ: z.string().default("UTC"),
    POSTGRES_HOST: z.string(),
    POSTGRES_DATABASE: z.string(),
    POSTGRES_DATABASE_OVERRIDE: z
      .string()
      .default(process.env.POSTGRES_DATABASE!), // for db:create/delete we want to connect to the `postgres` database and target our app database
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_LOCAL_PORT: z.coerce.number().optional(),
    POSTGRES_LOCAL_WS_PORT: z.coerce.number().optional(),
    POSTGRES_URL: z.string(),
    LOG_QUERIES: z.string().transform(stringToBoolean).default("false"),
    HEADLESS: z.string().transform(stringToBoolean).default("false"),
    OPENAI_API_KEY: z.string(),
    PORT: z.coerce.number().optional().default(3000),
  },
  client: {
    NEXT_PUBLIC_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
  },
});
