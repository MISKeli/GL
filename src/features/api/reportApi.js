import { indexApi } from "./indexApi";

const reportApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["report"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      GenerateGLReportPage: builder.query({
        query: (params) => ({
          url: `/report/general-ledger-report`,
          method: "GET",
          params,
        }),
        providesTags: ["report"],
      }),
    }),
  });

export const {
  useGenerateGLReportPageQuery,
  useLazyGenerateGLReportPageQuery,
} = reportApi;
