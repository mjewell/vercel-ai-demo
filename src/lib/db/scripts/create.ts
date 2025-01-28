import "@/lib/env/load";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sql } from "drizzle-orm";

async function run() {
  await db.execute(sql.raw(`CREATE DATABASE "${env.POSTGRES_DATABASE}";`));
  console.log(`Database ${env.POSTGRES_DATABASE} created`);
  process.exit(0);
}

run();
