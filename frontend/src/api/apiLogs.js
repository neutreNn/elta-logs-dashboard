import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiLogs = createApi({
  reducerPath: "apiLogs",
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
  tagTypes: ["Operators", "CalibrationEntries"],
  endpoints: (builder) => ({
    // Получение всех настроек операторов с фильтрацией и пагинацией
    getAllOperators: builder.query({
      query: (params) => ({
        url: "/logs",
        params,
      }),
      providesTags: ["Operators"],
    }),
    
    // Получение конкретной настройки оператора по ID
    getOperatorById: builder.query({
      query: (id) => `/logs/${id}`,
      providesTags: (result, error, id) => [{ type: "Operators", id }],
    }),
    
    // Получение калибровочных записей для оператора с пагинацией
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
    
    // Создание новой записи лога (настройки оператора + калибровочные данные)
    createLogEntry: builder.mutation({
      query: (data) => ({
        url: "/logs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Operators", "CalibrationEntries"],
    }),
    
    // Удаление записи лога и всех связанных данных
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
  }),
});

export const { 
  useGetAllOperatorsQuery, 
  useGetOperatorByIdQuery,
  useGetCalibrationEntriesByOperatorIdQuery,
  useCreateLogEntryMutation,
  useRemoveLogEntryMutation 
} = apiLogs;

export default apiLogs;