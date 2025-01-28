import { Table } from "drizzle-orm";
import { pgTableCreator, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

const createZodSchemas = <TTable extends Table>(table: TTable) => {
  return {
    select: createSelectSchema(table),
    insert: createInsertSchema(table),
    update: createUpdateSchema(table),
  };
};

const pgTable = pgTableCreator((name) => `vercel_ai_demo_${name}`);

export const things = pgTable("things", {
  id: uuid().primaryKey().defaultRandom(),
  createdAt: timestamp({ mode: "date", precision: 3 })
    .notNull()
    .$default(() => new Date()),
  updatedAt: timestamp({ mode: "date", precision: 3 })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const zodThing = createZodSchemas(things);
