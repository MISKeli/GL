import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Create API service with dynamic base URL and token handling
export const testerApi = createApi({
  reducerPath: "testApi",
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers, { endpoint, token }) => {
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: ["test"],
  endpoints: (builder) => ({
    testConnect: builder.query({
      query: ({ endpoint, token, ...params }) => {
        const queryParams = new URLSearchParams(params).toString(); // Handle dynamic params
        return {
          url: `${endpoint}`, // Append params as query string
          method: "GET",
          params: queryParams,
          headers: {
            "x-api-key": `${token}`, // Set the Authorization header
            Accept: "application/json", // Set the Accept header
          },
        };
      },
      transformResponse: (response) => response, // Assuming API returns { data: ... }
    }),
  }),
});

export const { useTestConnectQuery, useLazyTestConnectQuery } = testerApi;

// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// // Create API service with dynamic base URL and token handling
// export const testerApi = createApi({
//   reducerPath: "testApi",
//   baseQuery: fetchBaseQuery({
//     prepareHeaders: (headers, { endpoint, token }) => {
//       headers.set("Accept", "application/json");
//       return headers;
//     },
//   }),
//   tagTypes: ["test"],
//   endpoints: (builder) => ({
//     testConnect: builder.query({
//       query: ({ endpoint, token }) => ({
//         url: `${endpoint}`, // Endpoint dynamically passed
//         method: "GET",

//         headers: {
//           "x-api-key": `${token}`, // Set the Authorization header
//           Accept: "application/json", // Set the Accept header
//         },
//       }),
//       transformResponse: (response) => response, // Assuming API returns { data: ... }
//     }),
//   }),
// });

// export const { useTestConnectQuery, useLazyTestConnectQuery } = testerApi;
