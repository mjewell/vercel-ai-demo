import "@/lib/env/load";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sql } from "drizzle-orm";

async function run() {
  await db.execute(
    sql.raw(`DROP DATABASE IF EXISTS "${env.POSTGRES_DATABASE}";`)
  );
  console.log(`Database ${env.POSTGRES_DATABASE} dropped`);
  process.exit(0);
}

run();
