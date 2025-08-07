import { indexApi } from "./indexApi";

const promptAIApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["promptAI"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      Gemini: builder.mutation({
        query: (body) => ({
          url: `/gemini/ask`,
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["promptAI"],
      }),
    }),
  });

export const { useGeminiMutation } = promptAIApi;
