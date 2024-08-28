import { indexApi } from "./indexApi";

const userApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["users"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      addUser: builder.mutation({
        query: (body) => ({
          url: `/users`,
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["users"],
      }),
      getAllUser:builder.query({
        query: (params) => ({
          url: `/user/page`,
          method: "GET",
          params,
        }),
        providesTags: ["users"],
      }),
      updateUser: builder.mutation({
        query: ({ id, ...body }) => ({
          url: `/user/${id}`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: (_, error) => (error ? [] : ["users"]),
      }),
    }),
  });

export const { useAddUserMutation,useGetAllUserQuery,useUpdateUserMutation } = userApi;
