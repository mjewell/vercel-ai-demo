CREATE TABLE "vercel_ai_demo_facts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"embedding" vector(1) NOT NULL,
	"process_id" uuid NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE INDEX "factsEmbeddingIndex" ON "vercel_ai_demo_facts" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint