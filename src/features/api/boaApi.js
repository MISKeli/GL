import { indexApi } from "./indexApi";

const boaApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["boa"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      GenerateHorizontalPurchasesBookPerMonth: builder.query({
        //for viewing horizontal
        query: (params) => ({
          url: `/book-of-accounts/purchases-book/horizontal/page`,
          method: "GET",
          params,
        }),
        providesTags: ["boa"],
      }),

      GenerateHorizontalCashDisbursementBookPerMonth: builder.query({
        //for viewing horizontal
        query: (params) => ({
          url: `/book-of-accounts/cash-disbursement-book/horizontal/page`,
          method: "GET",
          params,
        }),
        providesTags: ["boa"],
      }),

      GenerateVerticalPurchasesBookPerMonthPagination: builder.query({
        //for viewing vertical
        query: (params) => ({
          url: `/book-of-accounts/purchases-book/page`,
          method: "GET",
          params,
        }),
        providesTags: ["boa"],
      }),
      GenerateCashDisbursementBookPerMonthPagination: builder.query({
        //for viewing vertical
        query: (params) => ({
          url: `/bookofaccounts/cashdisbursementbook/page`,
          method: "GET",
          params,
        }),
        providesTags: ["boa"],
      }),
      GenerateSaleJournalBookPerMonthPagination: builder.query({
        query: (params) => ({
          url: `/bookofaccounts/salesjournal/page`,
          method: "GET",
          params,
        }),
        providesTags: ["boa"],
      }),
      ExportGenerateSaleJournalBookPerMonth: builder.query({
        query: (params) => ({
          url: `/bookofaccounts/salesjournal`,
          method: "GET",
          params,
        }),
        providesTags: ["boa"],
      }),
      GenerateTrialBalancePerMonthPagination: builder.query({
        // for viewing vertical
        query: (params) => ({
          url: `/bookofaccounts/trialbalance/page`,
          method: "GET",
          params,
        }),
        providesTags: ["boa"],
      }),

      GenerateVerticalCashDisbursementBookPerMonth: builder.query({
        // for viewing vertical
        query: (params) => ({
          url: `/book-of-accounts/cash-disbursement-book/vertical/page`,
          method: "GET",
          params,
        }),
        providesTags: ["boa"],
      }),
      GenerateVerticalCashReceiptBookPerMonthPagination: builder.query({
        // for viewing vertical
        query: (params) => ({
          url: `/book-of-accounts/cash-receipt-book/vertical/page`,
          method: "GET",
          params,
        }),
        providesTags: ["boa"],
      }),
      GenerateJournalBookPage: builder.query({
        // for viewing vertical
        query: (params) => ({
          url: `/book-of-accounts/journal-book/page`,
          method: "GET",
          params,
        }),
        providesTags: ["boa"],
      }),
    }),
  });

export const {
  useGenerateVerticalCashReceiptBookPerMonthPaginationQuery,
  useExportGenerateSaleJournalBookPerMonthQuery,
  useExportGenerateTrialBalancePerMonthQuery,
  useGenerateTrialBalancePerMonthPaginationQuery,
  useExportVerticalCashDisbursementBookPerMonthQuery,
  useGenerateVerticalCashDisbursementBookPerMonthQuery,
  useGenerateHorizontalCashDisbursementBookPerMonthQuery,
  useGenerateHorizontalPurchasesBookPerMonthQuery,
  useGenerateVerticalPurchasesBookPerMonthPaginationQuery,
  useGenerateCashDisbursementBookPerMonthPaginationQuery,
  useGenerateSaleJournalBookPerMonthPaginationQuery,
  useExportVerticalPurchasesBookPerMonthQuery,
  useGenerateJournalBookPageQuery,
  useLazyGenerateJournalBookPageQuery
} = boaApi;
