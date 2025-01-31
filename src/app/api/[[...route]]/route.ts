import { dbTxnMiddleware } from "@/lib/db/txn-middleware";
import * as TestDescriptionsService from "@/services/test-descriptions";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono().basePath("/api");

app.use(requestId());
app.use(logger());
app.use(contextStorage());

app.post(
  "/test-descriptions",
  zValidator("json", TestDescriptionsService.processTests.params.shape.tests),
  dbTxnMiddleware,
  async (c) => {
    const tests = c.req.valid("json");
    const result = await TestDescriptionsService.processTests({ tests });
    return c.json(result);
  }
);

app.get(
  "/test-descriptions/similar",
  zValidator("query", TestDescriptionsService.similarTests.params),
  async (c) => {
    const { userQuery } = c.req.valid("query");
    const result = await TestDescriptionsService.similarTests({ userQuery });
    return c.json(result);
  }
);

app.get(
  "/test-descriptions/answer",
  zValidator("query", TestDescriptionsService.answer.params),
  async (c) => {
    const { userQuery } = c.req.valid("query");
    const result = await TestDescriptionsService.answer({
      userQuery,
    });
    return c.json(result);
  }
);

export const GET = handle(app);
export const POST = handle(app);
