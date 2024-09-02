import { indexApi } from "./indexApi";

const roleApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["role"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getAllUserRoles: builder.query({
        query: (params) => ({
          url: `/role/page`,
          method: "GET",
          params,
        }),
        providesTags: ["role"],
      }),
      addRole: builder.mutation({
        query: (body) => ({
          url: `/role`,
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["role"],
      }),
      updateRole: builder.mutation({
        query: ({ id, ...body }) => ({
          url: `/role/${id}`,
          method: "PUT",
          body: body,
        }),
        invalidatesTags: (_, error) => (error ? [] : ["role"]),
      }),
    }),
  });

export const {
  useGetAllUserRolesQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
} = roleApi;
