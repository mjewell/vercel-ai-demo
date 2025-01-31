import { EmbeddingModel } from "ai";

export const dogModel: EmbeddingModel<string> = {
  specificationVersion: "v1",
  provider: "mj",
  modelId: "dog-gpt", // precursor to cat-gpt
  maxEmbeddingsPerCall: 1000,
  supportsParallelCalls: true,
  async doEmbed({ values }) {
    return {
      embeddings: values.map((value) => {
        const mentionsDogs = value.toLocaleLowerCase().includes("dog");
        return [mentionsDogs ? 1 : -1];
      }),
    };
  },
};
