import * as schema from "@/lib/db/schema";
import { getContext } from "@/lib/services/context";
import { createService } from "@/lib/services/create-service";
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { and, eq, not } from "drizzle-orm";
import { z } from "zod";

const embeddingModel = openai.embedding("text-embedding-ada-002");

export const processTests = createService({
  params: z.object({
    tests: z.array(
      z.object({
        name: z.string(),
        file: z.string(),
      })
    ),
  }),
  handler: async ({ tests }) => {
    const { db } = getContext();

    const parsed = tests.map((t) => {
      const [it, ...describes] = t.name.split(" > ").reverse();
      const describe = describes.reverse().join(" ");

      return {
        filename: t.file,
        sourceText: t.name,
        formattedText: `The file "${t.file}" has tests that describe "${describe}" and ensure it "${it}"`,
      };
    });

    const newProcessId = crypto.randomUUID();
    const unmatchedRows: typeof parsed = [];

    for (const p of parsed) {
      const [existing] = await db
        .select()
        .from(schema.testDescriptions)
        .where(
          and(
            eq(schema.testDescriptions.filename, p.filename),
            eq(schema.testDescriptions.sourceText, p.sourceText)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .update(schema.testDescriptions)
          .set({ processId: newProcessId })
          .where(eq(schema.testDescriptions.id, existing.id));
      } else {
        unmatchedRows.push(p);
      }
    }

    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: unmatchedRows.map((r) => r.formattedText),
    });

    await db.insert(schema.testDescriptions).values(
      embeddings.map((embedding, i) => ({
        ...unmatchedRows[i],
        embedding,
        processId: newProcessId,
      }))
    );

    const deleteResult = await db
      .delete(schema.testDescriptions)
      .where(not(eq(schema.testDescriptions.processId, newProcessId)));

    return {
      created: unmatchedRows.length,
      updated: parsed.length - unmatchedRows.length,
      deleted: deleteResult.rowCount ?? 0,
    };
  },
});
