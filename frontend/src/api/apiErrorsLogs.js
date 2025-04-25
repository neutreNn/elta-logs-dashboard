// apiErrorsLogs.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiErrorsLogs = createApi({
  reducerPath: "apiErrorsLogs",
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
  tagTypes: ["LogsError"],
  endpoints: (builder) => ({
    getAllLogsErrors: builder.query({
      query: (params) => ({
        url: "/logs-errors",
        params,
      }),
      providesTags: ["LogsError"],
    }),
    getErrorsAggregatedStats: builder.query({
      query: (params) => ({
        url: "/logs-errors/aggregated-stats",
        params,
      }),
      providesTags: ["LogsError"],
    }),
    hasUnviewedErrors: builder.query({
      query: () => ({
        url: "/logs-errors/unviewed",
      }),
      providesTags: ["LogsError"],
    }),
    markAllErrorsAsViewed: builder.mutation({
      query: () => ({
        url: '/logs-errors/mark-viewed',
        method: 'PUT',
      }),
      invalidatesTags: ["LogsError"],
    }),
  }),
});

export const { 
  useGetAllLogsErrorsQuery,
  useHasUnviewedErrorsQuery,
  useMarkAllErrorsAsViewedMutation,
  useGetErrorsAggregatedStatsQuery
} = apiErrorsLogs;

export default apiErrorsLogs;