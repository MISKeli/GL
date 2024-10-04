import { indexApi } from "./indexApi";

const importReportApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["import"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      ImportReports: builder.mutation({
        query: ({ ...data }) => ({
          url: `/reports/import`,
          method: "POST",
          body: data,
        }),
        providesTags: ["import"],
      }),
      GetAllGLReportAsync: builder.query({
        query: (params) => ({
          url: `/report/general-ledger`,
          method: "GET",
          params,
        }),
        providesTags: ["import"],
      }),
    }),
  });

export const {
  useImportReportsMutation,
  useGetAllGLReportAsyncQuery,
  useLazyGetAllGLReportAsyncQuery,
} = importReportApi;
