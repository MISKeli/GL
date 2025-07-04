import { indexApi } from "./indexApi";

const accountTitleApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["accountTitle"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      ImportAccountTitle: builder.mutation({
        query: (body) => ({
          url: `/account_title/sync`,
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["accountTitle"],
      }),
      GenerateAccountTitle: builder.query({
        query: (params) => ({
          url: `/account_title/page`,
          method: "GET",
          params,
        }),
        providesTags: ["accountTitle"],
      }),
    }),
  });

export const {
  useGenerateAccountTitleQuery,
  useImportAccountTitleMutation,
  useLazyGenerateAccountTitleQuery,
} = accountTitleApi;
