CREATE TABLE "vercel_ai_demo_test_descriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"source_text" text NOT NULL,
	"formatted_text" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"process_id" uuid NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE INDEX "embeddingIndex" ON "vercel_ai_demo_test_descriptions" USING hnsw ("embedding" vector_cosine_ops);