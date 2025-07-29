// api/apiFirmware.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiFirmware = createApi({
  reducerPath: "apiFirmware",
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
  tagTypes: ["Firmwares"],
  endpoints: (builder) => ({
    getAllFirmwares: builder.query({
      query: (params) => ({
        url: "/firmware",
        params,
      }),
      providesTags: ["Firmwares"],
    }),
    getFirmwareById: builder.query({
      query: (id) => `/firmware/${id}`,
      providesTags: (result, error, id) => [{ type: "Firmwares", id }],
    }),
    uploadFirmware: builder.mutation({
      query: (formData) => ({
        url: "/firmware",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Firmwares"],
    }),
    deleteFirmware: builder.mutation({
      query: (id) => ({
        url: `/firmware/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Firmwares"],
    }),
    checkForUpdates: builder.query({
      query: (params) => ({
        url: "/firmware/check",
        params,
      }),
    }),
  }),
});

export const {
  useGetAllFirmwaresQuery,
  useGetFirmwareByIdQuery,
  useUploadFirmwareMutation,
  useDeleteFirmwareMutation,
  useCheckForUpdatesQuery,
} = apiFirmware;

export default apiFirmware;