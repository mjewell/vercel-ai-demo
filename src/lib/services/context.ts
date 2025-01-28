import { DbTxnEnv } from "@/lib/db/txn-middleware";
import { getContext as honoGetContext } from "hono/context-storage";

type ContextEnv = DbTxnEnv;

let serviceContext: ContextEnv["Variables"] | null = null;

export function setServiceContext(context: ContextEnv["Variables"]) {
  serviceContext = context;
}

export function getContext() {
  return serviceContext ?? honoGetContext<ContextEnv>().var;
}
