import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = () => {
  if (import.meta.env.VITE_GL_STAGE === "dev") {
    return import.meta.env.VITE_GL_ENDPOINT_LOCAL;
  } else if (import.meta.env.VITE_GL_STAGE === "pretest") {
    return import.meta.env.VITE_GL_ENDPOINT_PRETEST;
  } else {
    return import.meta.env.VITE_GL_ENDPOINT_PRODUCTION;
  }
};
console.log("🚀 ~ baseUrl ~ baseUrl:", baseUrl());

export const indexApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl(),
    prepareHeaders: (headers, { getState }) => {
      headers.set("Authorization", "Bearer " + getState().auth.token);
      //console.log("token",getState().auth.token)
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  endpoints: () => ({}),
});
