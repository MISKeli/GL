import { indexApi } from "./indexApi";

const userApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["users"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      addUser: builder.mutation({
        query: (body) => ({
          url: `/user`,
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["users"],
      }),
      getAllUser: builder.query({
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
          method: "PUT",
          body: body,
        }),
        invalidatesTags: (_, error) => (error ? [] : ["users"]),
      }),
      updateUserStatus: builder.mutation({
        query: (id) => ({
          url: `/user/${id}`,
          method: "PATCH",
        }),
        invalidatesTags: (_, error) => (error ? [] : ["users"]),
      }),
    }),
  });

export const { useAddUserMutation, useGetAllUserQuery, useUpdateUserMutation, useUpdateUserStatusMutation } =
  userApi;
