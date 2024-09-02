import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const cedarApi = createApi({
  reducerPath: "cedarApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_CEDAR_ENDPOINT,
    prepareHeaders: (headers) => {
      headers.set(
        "Authorization",
        `Bearer ${import.meta.env.VITE_CEDAR_BEARER_TOKEN}`
      );
      headers.set("Accept", "application/json");
      return headers;
    },
  }),

  tagTypes: ["Cedar"],
  endpoints: (builder) => ({
    getCedarData: builder.query({
      query: (params) => ({
        url: "",
        method: "GET",
        params: params,
      }),
      transformResponse: (res) => res.data,
    }),
  }),
});
export const { useGetCedarDataQuery, useLazyGetCedarDataQuery } = cedarApi;
