import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiStandIds = createApi({
  reducerPath: "apiStandIds",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4444",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getStandIds: builder.query({
      query: () => "/stand-ids",
    }),
  }),
});

export const {
  useGetStandIdsQuery,
} = apiStandIds;

export default apiStandIds;