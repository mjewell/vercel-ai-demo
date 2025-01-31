import { dbTxnMiddleware } from "@/lib/db/txn-middleware";
import * as TestDescriptionsService from "@/services/test-descriptions";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

export const app = new Hono().basePath("/test-descriptions");

app.post(
  "/",
  zValidator("json", TestDescriptionsService.process.params.shape.tests),
  dbTxnMiddleware,
  async (c) => {
    const tests = c.req.valid("json");
    const result = await TestDescriptionsService.process({ tests });
    return c.json(result);
  }
);

app.get(
  "/similar",
  zValidator("query", TestDescriptionsService.similar.params),
  async (c) => {
    const { userQuery } = c.req.valid("query");
    const result = await TestDescriptionsService.similar({ userQuery });
    return c.json(result);
  }
);

app.get(
  "/answer",
  zValidator("query", TestDescriptionsService.answer.params),
  async (c) => {
    const { userQuery } = c.req.valid("query");
    const result = await TestDescriptionsService.answer({
      userQuery,
    });
    return c.json(result);
  }
);
