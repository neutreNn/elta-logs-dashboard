import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const apiUser = createApi({
  reducerPath: 'apiUser',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4444',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    authLogin: builder.mutation({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
    }),
    authMe: builder.query({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
    }),
    validateToken: builder.mutation({
      query: () => ({
        url: '/auth/validate',
        method: 'POST',
      }),
    }),
  }),
});

export const { 
  useAuthLoginMutation,
  useAuthMeQuery,
  useValidateTokenMutation,
} = apiUser;

export default apiUser;