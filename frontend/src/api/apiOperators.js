import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiOperators = createApi({
  reducerPath: "apiOperators",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getOperatorNames: builder.query({
      query: () => "/operators",
    }),
  }),
});

export const {
  useGetOperatorNamesQuery,
} = apiOperators;

export default apiOperators;
