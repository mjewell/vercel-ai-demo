import { env } from "@/lib/env";
import { neonConfig } from "@neondatabase/serverless";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

const { POSTGRES_HOST, POSTGRES_LOCAL_WS_PORT, LOG_QUERIES } = env;

if (POSTGRES_HOST === "localhost") {
  neonConfig.wsProxy = (host) => `${host}:${POSTGRES_LOCAL_WS_PORT}/v1`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

export const db = drizzle(sql, {
  schema,
  logger: LOG_QUERIES,
  casing: "snake_case",
});

export type TxnType = Parameters<Parameters<typeof db.transaction>[0]>[0];
