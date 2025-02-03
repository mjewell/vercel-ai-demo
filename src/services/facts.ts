import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { getContext } from "@/lib/services/context";
import { createService } from "@/lib/services/create-service";
import { dogModel } from "@/utils/embedding/dog";
import { concatGpt } from "@/utils/llm/concatGpt";
import { embed, embedMany, generateText } from "ai";
import {
  cosineDistance,
  desc,
  eq,
  gt,
  inArray,
  not,
  or,
  sql,
} from "drizzle-orm";
import { chunk } from "remeda";
import { z } from "zod";

const embeddingModel = dogModel;
const languageModel = concatGpt;

export const process = createService({
  params: z.object({
    facts: z.array(z.string()),
  }),
  handler: async ({ facts }) => {
    const { db } = getContext();

    const newProcessId = crypto.randomUUID();
    const matchedIds: string[] = [];
    const unmatchedRows: typeof facts = [];

    const batches = chunk(facts, 5);

    for (const batch of batches) {
      const existing = await db
        .select()
        .from(schema.facts)
        .where(or(...batch.map((fact) => eq(schema.facts.text, fact))));

      for (const fact of batch) {
        const match = existing.find((e) => e.text === fact);
        if (match) {
          matchedIds.push(match.id);
        } else {
          unmatchedRows.push(fact);
        }
      }
    }

    if (matchedIds.length !== 0) {
      // mark existing rows so they don't get deleted
      await db
        .update(schema.facts)
        .set({ processId: newProcessId })
        .where(inArray(schema.facts.id, matchedIds));
    }

    const unmatchedBatches = chunk(unmatchedRows, 5);

    if (unmatchedRows.length !== 0) {
      for (const batch of unmatchedBatches) {
        // generate embeddings for new rows
        const { embeddings } = await embedMany({
          model: embeddingModel,
          values: batch,
        });

        // insert new rows
        await db.insert(schema.facts).values(
          embeddings.map((embedding, i) => ({
            text: batch[i],
            embedding,
            processId: newProcessId,
          }))
        );
      }
    }

    // delete rows that no longer exist
    const deleteResult = await db
      .delete(schema.facts)
      .where(not(eq(schema.facts.processId, newProcessId)));

    return {
      created: unmatchedRows.length,
      updated: matchedIds.length,
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
      schema.facts.embedding,
      userQueryEmbedding
    )})`;

    const similarRows = await db
      .select({
        text: schema.facts.text,
        embedding: schema.facts.embedding,
        similarity,
      })
      .from(schema.facts)
      .where(gt(similarity, 0.5))
      .orderBy(desc(similarity))
      .limit(5);

    return { userQueryEmbedding, similarRows };
  },
});

export const answer = createService({
  params: z.object({
    userQuery: z.string(),
  }),
  handler: async ({ userQuery }) => {
    const { userQueryEmbedding, similarRows } = await similar({ userQuery });

    const result = await generateText({
      model: languageModel,
      prompt: userQuery,
      system: `
      You are a helpful assistant.
    
      Given the following facts, enclosed by triple quotes with one fact per line:

      """
      ${similarRows.map((r) => r.text).join("\n")}
      """
      
      Try to help the user figure out what they are looking for.

      If no relevant information is found above, respond with "Sorry, I don't know."
    `,
      experimental_providerMetadata: {
        mj: {
          similarItems: similarRows.map((r) => r.text),
        },
      },
    });

    return {
      userQuery: {
        text: userQuery,
        embedding: userQueryEmbedding,
      },
      similarRows,
      result,
    };
  },
});
