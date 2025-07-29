import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiStands = createApi({
  reducerPath: "apiStands",
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
  tagTypes: ["Stands"],
  endpoints: (builder) => ({
    getAllStands: builder.query({
      query: (params) => ({
        url: "/stands",
        params,
      }),
      providesTags: ["Stands"],
    }),
    getStandById: builder.query({
      query: (standId) => `/stands/${standId}`,
      providesTags: (result, error, standId) => [{ type: "Stands", standId }],
    }),
    getStandByStandId: builder.query({
      query: (standId) => `/stands/by-stand-id/${standId}`,
      providesTags: (result, error, standId) => [{ type: "Stands", standId }],
    }),
    createStand: builder.mutation({
      query: (data) => ({
        url: "/stands",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Stands"],
    }),
    updateStand: builder.mutation({
      query: ({ standId, ...data }) => ({
        url: `/stands/${standId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { standId }) => [{ type: "Stands", standId }, "Stands"],
    }),
    addRepairRecord: builder.mutation({
      query: ({ standId, ...data }) => ({
        url: `/stands/${standId}/repair`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { standId }) => [{ type: "Stands", standId }, "Stands"],
    }),
    removeStand: builder.mutation({
      query: (standId) => ({
        url: `/stands/${standId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, standId) => [{ type: "Stands", standId }, "Stands"],
    }),
  }),
});

export const { 
  useGetAllStandsQuery, 
  useGetStandByIdQuery, 
  useGetStandByStandIdQuery,
  useCreateStandMutation,
  useUpdateStandMutation,
  useAddRepairRecordMutation,
  useRemoveStandMutation 
} = apiStands;

export default apiStands;