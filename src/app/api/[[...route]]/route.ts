import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { handle } from "hono/vercel";
import { app as factsApp } from "./facts";
import { app as testDescriptionsApp } from "./test-descriptions";

export const runtime = "edge";

const app = new Hono().basePath("/api");

app.use(requestId());
app.use(logger());
app.use(contextStorage());

app.route("/", factsApp);
app.route("/", testDescriptionsApp);

export const GET = handle(app);
export const POST = handle(app);
