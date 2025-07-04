import { indexApi } from "./indexApi";

const chargeOfAccountApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["coa"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      ImportCharging: builder.mutation({
        query: (body) => ({
          url: `/charging/sync`,
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["coa"],
      }),
      GenerateCharging: builder.query({
        query: (params) => ({
          url: `/charging/page`,
          method: "GET",
          params,
        }),
        providesTags: ["coa"],
      }),
    }),
  });

export const { useGenerateChargingQuery, useLazyGenerateChargingQuery, useImportChargingMutation } =
  chargeOfAccountApi;
