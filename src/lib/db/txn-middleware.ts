import { createMiddleware } from "hono/factory";
import { TxnType, db } from ".";

type DbTxnVariables = {
  db: typeof db | TxnType;
};

export type DbTxnEnv = {
  Variables: DbTxnVariables;
};

export const dbTxnMiddleware = createMiddleware<DbTxnEnv>(async (c, next) => {
  await db.transaction(async (txn) => {
    c.set("db", txn);
    await next();
  });
});
