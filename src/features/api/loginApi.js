import { indexApi } from "./indexApi";

const loginApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["auth"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      postLogin: builder.mutation({
        query: (body) => ({
          url: "/auth",
          method: "POST",
          body,
        }),
      }),
    }),
  });

export const { usePostLoginMutation } = loginApi;
