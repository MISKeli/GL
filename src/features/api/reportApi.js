import { indexApi } from "./indexApi";
import moment from "moment";

const reportApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["report", "exportReport"] })
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
      ExportGLReport: builder.query({
        query: (params) => ({
          url: `/report/general-ledger-report`,
          method: "GET",
          params,
          responseHandler: async (response) => {
            const blob = await response.blob();
            const headers = response.headers.get("Content-Disposition");
            return { blob, headers };
          },
        }),

        transformResponse: async ({ blob, headers }, meta, arg) => {
          // Console log the arg parameter

          // Extract system name from arg
          const systemName = arg.BookName || "ALL SYSTEM";

          // Format the date - assuming FromMonth is in the format from your SystemViewingPage
          let dateFormat = "MMYYYY";
          if (arg.FromMonth) {
            // Parse the date and format it as MMYYYY
            const fromDate = moment(arg.FromMonth);
            dateFormat = fromDate.isValid()
              ? fromDate.format("MMYYYY")
              : "MMYYYY";
          }

          // Create filename in format: SYSTEM - BOOKNAME MMYYYY
          const fileName = `${systemName} - ${dateFormat}`;

          // Download the file
          const hiddenElement = document.createElement("a");
          const url = window.URL || window.webkitURL;
          const blobExcel = url.createObjectURL(blob);
          hiddenElement.href = blobExcel;
          hiddenElement.target = "_blank";
          hiddenElement.download = `${fileName}.xlsx`;
          hiddenElement.click();

          // Clean up the URL object
          url.revokeObjectURL(blobExcel);

          return null;
        },
      }),
    }),
  });

export const {
  useGenerateGLReportPageQuery,
  useLazyGenerateGLReportPageQuery,
  useLazyExportGLReportQuery,
} = reportApi;
