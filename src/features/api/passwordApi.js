import { indexApi } from "./indexApi";

const passwordApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["password"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      changePassword: builder.mutation({
        query: ({ ...body }) => ({
          url: `/user/change-password`,
          method: "PATCH",
          body: body,
        }),
        invalidatesTags: (_, error) => (error ? [] : ["password"]),
      }),
      resetPassword: builder.mutation({
        query: (id) => ({
          url: `/user/${id}/reset-password/`,
          method: "PATCH",
        }),
        invalidatesTags: (_, error) => (error ? [] : ["password"]),
      }),
    }),
  });

export const { useChangePasswordMutation, useResetPasswordMutation } =
  passwordApi;
