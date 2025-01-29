import { Table } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
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

export const testDescriptions = pgTable(
  "test_descriptions",
  {
    id: uuid().primaryKey().defaultRandom(),
    filename: text().notNull(),
    sourceText: text().notNull(),
    formattedText: text().notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    processId: uuid().notNull(),
    createdAt: timestamp({ mode: "date", precision: 3 })
      .notNull()
      .$default(() => new Date()),
    updatedAt: timestamp({ mode: "date", precision: 3 })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    embeddingIndex: index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);

export const zodTestDescriptions = createZodSchemas(testDescriptions);
