import { dbTxnMiddleware } from "@/lib/db/txn-middleware";
import * as FactsService from "@/services/facts";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

export const app = new Hono().basePath("/facts");

app.post(
  "/",
  zValidator("json", FactsService.process.params.shape.facts),
  dbTxnMiddleware,
  async (c) => {
    const facts = c.req.valid("json");
    const result = await FactsService.process({ facts });
    return c.json(result);
  }
);

app.get(
  "/similar",
  zValidator("query", FactsService.similar.params),
  async (c) => {
    const { userQuery } = c.req.valid("query");
    const result = await FactsService.similar({ userQuery });
    return c.json(result);
  }
);

app.get(
  "/answer",
  zValidator("query", FactsService.answer.params),
  async (c) => {
    const { userQuery } = c.req.valid("query");
    const result = await FactsService.answer({ userQuery });
    return c.json(result);
  }
);
