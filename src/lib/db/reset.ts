import { env } from "@/lib/env";
import { sql } from "drizzle-orm";
import { db } from "./index";

const { NODE_ENV, NEXT_PUBLIC_ENV } = env;

export async function resetDB() {
  if (NEXT_PUBLIC_ENV === "production" || NODE_ENV === "production") {
    throw new Error("Cannot reset DB in production");
  }

  const tableSchema = db._.schema;

  if (!tableSchema) {
    throw new Error("No table schema found");
  }

  const tableNames = Object.values(tableSchema).map((table) => table.dbName);

  await db.execute(sql.raw(`TRUNCATE TABLE ${tableNames.join(",")};`));
}
