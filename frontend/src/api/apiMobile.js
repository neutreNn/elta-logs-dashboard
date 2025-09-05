import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiMobile = createApi({
  reducerPath: "apiMobile",
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
  tagTypes: ["Mobiles"],
  endpoints: (builder) => ({
    getAllMobiles: builder.query({
      query: (params) => ({
        url: "/mobile",
        params,
      }),
      providesTags: ["Mobiles"],
    }),
    getMobileById: builder.query({
      query: (id) => `/mobile/${id}`,
      providesTags: (result, error, id) => [{ type: "Mobiles", id }, "Mobiles"],
    }),
    uploadMobile: builder.mutation({
      query: (formData) => ({
        url: "/mobile",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Mobiles"],
    }),
    deleteMobile: builder.mutation({
      query: (id) => ({
        url: `/mobile/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Mobiles"],
    }),
    updateMobile: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/mobile/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Mobiles"],
    }),
    addMobileFile: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/mobile/${id}/file`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Mobiles', id }],
    }),
    deleteMobileFile: builder.mutation({
      query: (fileId) => ({
        url: `/mobile/files/${fileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Mobiles'],
    }),
    downloadMobile: builder.mutation({
      query: ({ id, fileIndex, fileName }) => ({
        url: `/mobile/download/${id}`,
        params: { fileIndex },
        method: "GET",
        responseHandler: async (response) => await response.blob(),
      }),
    }),
  }),
});

export const {
  useGetAllMobilesQuery,
  useGetMobileByIdQuery,
  useUploadMobileMutation,
  useDeleteMobileMutation,
  useDownloadMobileMutation,
  useUpdateMobileMutation,
  useAddMobileFileMutation,
  useDeleteMobileFileMutation,
} = apiMobile;

export default apiMobile;