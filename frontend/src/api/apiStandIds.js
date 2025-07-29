import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiStandIds = createApi({
  reducerPath: "apiStandIds",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://172.68.35.171:5000",
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