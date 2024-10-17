import { indexApi } from "./indexApi";

const systemApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["system"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      AddNewSystem: builder.mutation({
        query: (body) => ({
          url: `/system`,
          method: "POST",
          body: body,
        }),
        providesTags: ["system"],
      }),
      GetAllSystemsAsync: builder.query({
        query: (params) => ({
          url: `/system/page`,
          method: "GET",
          params,
        }),
        providesTags: ["system"],
      }),
      updateSystem: builder.mutation({
        query: ({ id, ...body }) => ({
          url: `/system/${id}`,
          method: "PUT",
          body: body,
        }),
        invalidatesTags: (_, error) => (error ? [] : ["system"]),
      }),
      updateSystemStatus: builder.mutation({
        query: (params) => ({
          url: `/system/id`,
          method: "PATCH",
          params,
        }),
        invalidatesTags: (_, error) => (error ? [] : ["system"]),
      }),
    }),
  });

export const {
  useAddNewSystemMutation,
  useUpdateSystemMutation,
  useGetAllSystemsAsyncQuery,
  useLazyGetAllSystemsAsyncQuery,
  useUpdateSystemStatusMutation,
} = systemApi;
