import { LanguageModel } from "ai";

export const concatGpt: LanguageModel = {
  specificationVersion: "v1",
  provider: "mj",
  modelId: "concat-gpt",
  defaultObjectGenerationMode: undefined,
  async doGenerate({ prompt, providerMetadata }) {
    return {
      text: Array.isArray(providerMetadata?.mj.similarItems)
        ? providerMetadata.mj.similarItems.join(" ")
        : "No data provided",
      finishReason: "stop",
      usage: {
        completionTokens: 0,
        promptTokens: 0,
      },
      rawCall: {
        rawPrompt: prompt,
        rawSettings: {},
      },
    };
  },
  async doStream({ prompt }) {
    return {
      rawCall: {
        rawPrompt: prompt,
        rawSettings: {},
      },
      stream: new ReadableStream(),
    };
  },
};
