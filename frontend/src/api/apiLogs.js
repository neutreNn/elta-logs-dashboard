import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiLogs = createApi({
  reducerPath: "apiLogs",
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
  tagTypes: ["Operators", "CalibrationEntries"],
  endpoints: (builder) => ({
    getAllOperators: builder.query({
      query: (params) => ({
        url: "/logs",
        params,
      }),
      providesTags: ["Operators"],
    }),
    getOperatorById: builder.query({
      query: (id) => `/logs/${id}`,
      providesTags: (result, error, id) => [{ type: "Operators", id }],
    }),
    getCalibrationEntriesByOperatorId: builder.query({
      query: ({ operatorId, page, limit }) => ({
        url: `/logs/${operatorId}/calibration-entries`,
        params: { page, limit },
      }),
      providesTags: (result, error, arg) => [
        { type: "CalibrationEntries", id: arg.operatorId },
        "CalibrationEntries",
      ],
    }),
    createLogEntry: builder.mutation({
      query: (data) => ({
        url: "/logs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Operators", "CalibrationEntries"],
    }),
    removeLogEntry: builder.mutation({
      query: (id) => ({
        url: `/logs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Operators", id },
        "Operators", 
        { type: "CalibrationEntries", id },
        "CalibrationEntries"
      ],
    }),
    getSuccessfulCalibration: builder.query({
      query: (params) => ({
        url: "/logs/successful-calibration",
        params,
      }),
    }),
  }),
});

export const { 
  useGetAllOperatorsQuery, 
  useGetOperatorByIdQuery,
  useGetCalibrationEntriesByOperatorIdQuery,
  useCreateLogEntryMutation,
  useRemoveLogEntryMutation,
  useGetSuccessfulCalibrationQuery
} = apiLogs;

export default apiLogs;