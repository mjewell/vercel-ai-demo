import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { getContext } from "@/lib/services/context";
import { createService } from "@/lib/services/create-service";
import { openai } from "@ai-sdk/openai";
import { embed, embedMany, generateText } from "ai";
import { and, cosineDistance, desc, eq, gt, not, sql } from "drizzle-orm";
import { z } from "zod";

const embeddingModel = openai.embedding("text-embedding-ada-002");
const languageModel = openai("gpt-4o");

export const process = createService({
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

    // take the test string and turn it into a more human-friendly sentence
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

    // mark existing rows so they don't get deleted
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

    if (unmatchedRows.length !== 0) {
      // generate embeddings for new rows
      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: unmatchedRows.map((r) => r.formattedText),
      });

      // insert new rows
      await db.insert(schema.testDescriptions).values(
        embeddings.map((embedding, i) => ({
          ...unmatchedRows[i],
          embedding,
          processId: newProcessId,
        }))
      );
    }

    // delete rows that no longer exist
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

export const similar = createService({
  params: z.object({
    userQuery: z.string(),
  }),
  handler: async ({ userQuery }) => {
    const { embedding: userQueryEmbedding } = await embed({
      model: embeddingModel,
      value: userQuery,
    });

    const similarity = sql<number>`1 - (${cosineDistance(
      schema.testDescriptions.embedding,
      userQueryEmbedding
    )})`;

    return db
      .select({
        formattedText: schema.testDescriptions.formattedText,
        similarity,
      })
      .from(schema.testDescriptions)
      .where(gt(similarity, 0.5))
      .orderBy(desc(similarity))
      .limit(5);
  },
});

export const answer = createService({
  params: z.object({
    userQuery: z.string(),
  }),
  handler: async ({ userQuery }) => {
    const similarRows = await similar({ userQuery });

    const result = await generateText({
      model: languageModel,
      prompt: userQuery,
      system: `
        You are a helpful assistant that tells the user what behaviour might be supported by our code based on a list of test descriptions.
      
        Given the following test descriptions, enclosed by triple quotes with one test per line:

        """
        ${similarRows.map((r) => r.formattedText).join("\n")}
        """
        
        Try to help the user figure out what they are looking for, and make sure you provide the path to the file.

        If no relevant information is found above, respond with "Sorry, I don't know."
      `,
    });

    return {
      similarRows,
      result,
    };
  },
});
