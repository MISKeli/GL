import { indexApi } from "./indexApi";
const invalidatesTags = (_, error) => (error ? [] : ["system"]);
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
        invalidatesTags,
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
        query: (payload) => ({
          url: `/system/${payload.id}`,
          method: "PUT",
          body: payload.formData,
        }),
        invalidatesTags,
      }),
      updateSystemStatus: builder.mutation({
        query: (params) => ({
          url: `/system/id`,
          method: "PATCH",
          params,
        }),
        invalidatesTags,
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
