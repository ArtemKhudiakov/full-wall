import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useSelector } from 'react-redux';
import { AuthState, IUserProfile, LoginRequest, RegisterRequest, AuthResponse } from '../../types/common';

const TOKEN_NAME = 'jwt_token';

const initialState: AuthState = {
  token: localStorage.getItem(TOKEN_NAME),
  user: (() => {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (e) {
      console.error('Ошибка при загрузке пользователя из localStorage:', e);
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem(TOKEN_NAME),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: IUserProfile }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      localStorage.removeItem(TOKEN_NAME);
      localStorage.removeItem('user');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem(TOKEN_NAME);
      if (token && token.trim() !== '') {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          dispatch(setLoading(true));
          const { data } = await queryFulfilled;
          localStorage.setItem(TOKEN_NAME, data.access_token);
          console.log('data.jwt', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          dispatch(setCredentials({ token: data.access_token, user: data.user }));
        } catch (error) {
          dispatch(setError(error instanceof Error ? error.message : 'Ошибка при входе'));
        }
      },
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          dispatch(setLoading(true));
          const { data } = await queryFulfilled;
          localStorage.setItem(TOKEN_NAME, data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          dispatch(setCredentials({ token: data.access_token, user: data.user }));
          console.log('data.user', data.user);
        } catch (error) {
          dispatch(setError(error instanceof Error ? error.message : 'Ошибка при регистрации'));
        }
      },
    }),

    getProfile: builder.query<IUserProfile, string>({
      query: (id) => `/profile/${id}`,
    }),

    updateProfile: builder.mutation<IUserProfile, { id: string; data: Partial<IUserProfile> }>({
      query: ({ id, data }) => ({
        url: `/profile/${id}`,
        method: 'PUT',
        body: data,
      }),
      onQueryStarted: async ({ }, { dispatch, queryFulfilled }) => {
        try {
          dispatch(setLoading(true));
          const { data: updatedProfile } = await queryFulfilled;

          const userJson = localStorage.getItem('user');
          if (userJson) {
            const user = JSON.parse(userJson);
            const updatedUser = { ...user, ...updatedProfile };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            const token = localStorage.getItem(TOKEN_NAME);
            if (token) {
              dispatch(setCredentials({ token, user: updatedUser }));
            }
          }
        } catch (error) {
          dispatch(setError(error instanceof Error ? error.message : 'Ошибка при обновлении профиля'));
        }
      },
    }),

    uploadAvatar: builder.mutation<IUserProfile, { id: string; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('file', file);

        return {
          url: `/profile/${id}/avatar`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          dispatch(setLoading(true));
          const { data: updatedProfile } = await queryFulfilled;

          const userJson = localStorage.getItem('user');
          if (userJson) {
            const user = JSON.parse(userJson);
            const updatedUser = { ...user, avatar: updatedProfile.avatar };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            const token = localStorage.getItem(TOKEN_NAME);
            if (token) {
              dispatch(setCredentials({ token, user: updatedUser }));
            }
          }
        } catch (error) {
          dispatch(setError(error instanceof Error ? error.message : 'Ошибка при загрузке аватара'));
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation
} = authApi;

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;

export const selectCurrentUserId = (state: { auth: AuthState }) => state.auth.user?.id;

export const useCurrentProfile = () => {
  const userId = useSelector(selectCurrentUserId);
  return useGetProfileQuery(userId?.toString() || skipToken);
};

export default authSlice.reducer; 