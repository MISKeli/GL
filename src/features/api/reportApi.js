import { indexApi } from "./indexApi";

const reportApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["report"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      GetAllGLReportAsync: builder.query({
        query: (params) => ({
          url: `/report/general-ledger`,
          method: "GET",
          params,
        }),
        providesTags: ["report"],
      }),
    }),
  });

export const { useGetAllGLReportAsyncQuery, useLazyGetAllGLReportAsyncQuery } = reportApi;
