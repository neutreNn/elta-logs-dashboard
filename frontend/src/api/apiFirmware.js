import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiFirmware = createApi({
  reducerPath: "apiFirmware",
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
    downloadFirmware: builder.mutation({
      query: ({ id, fileName }) => ({
        url: `/firmware/download/${id}`,
        method: "GET",
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName || "firmware";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          return { data: null };
        },
      }),
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
  useDownloadFirmwareMutation,
  useCheckForUpdatesQuery,
} = apiFirmware;

export default apiFirmware;