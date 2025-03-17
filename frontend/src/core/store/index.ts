import { configureStore } from "@reduxjs/toolkit";
import authReducer, { authApi } from "./authSlice";
import postsReducer, { postsApi } from "./postsSlice";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postsReducer,
        [authApi.reducerPath]: authApi.reducer,
        [postsApi.reducerPath]: postsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authApi.middleware, postsApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;