import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IPost, PostsState } from '../../types/common';

const TOKEN_NAME = 'jwt_token';

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<IPost[]>) => {
      state.posts = action.payload;
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
    addPost: (state, action: PayloadAction<IPost>) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action: PayloadAction<IPost>) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    deletePost: (state, action: PayloadAction<number>) => {
      state.posts = state.posts.filter(post => post.id !== action.payload);
    },
  },
});

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem(TOKEN_NAME);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    getAllPosts: builder.query<IPost[], string>({
      query: (userId) => `/posts?userId=${userId}`,
      providesTags: ['Posts'],
    }),

    createPost: builder.mutation<IPost, FormData>({
      query: (formData) => ({
        url: '/posts',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Posts'],
    }),

    updatePost: builder.mutation<IPost, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Posts'],
    }),

    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Posts'],
    }),

    likePost: builder.mutation<IPost, number>({
      query: (id) => ({
        url: `/posts/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Posts'],
    }),
  }),
});

export const {
  useGetAllPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useLikePostMutation,
} = postsApi;

export const { setPosts, setLoading, setError, addPost, updatePost, deletePost } = postsSlice.actions;

export default postsSlice.reducer;
