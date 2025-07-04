import { indexApi } from "./indexApi";

const closedDateApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["closed"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      GetSystemClosedDate: builder.query({
        query: (params) => ({
          url: `/closed-date`,
          method: "GET",
          params,
        }),
        providesTags: ["closed"],
      }),
      PutSystemClosedDate: builder.mutation({
        query: (body) => ({
          url: `/closed-date/${body.id}`,
          method: "PUT",
          body: body,
        }),
        invalidatesTags: (_, error) => (error ? [] : ["closed"]),
      }),
    }),
  });

export const {
  useGetSystemClosedDateQuery,
  useLazyGetSystemClosedDateQuery,
  usePutSystemClosedDateMutation,
} = closedDateApi;
