export interface IUserProfile {
  id: number;
  avatar: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  about: string;
  email: string;
  phone: string;
}

export interface IPost {
  id: number;
  text: string;
  images: string[];
  author: IUserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  token: string | null;
  user: IUserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: IUserProfile;
}

export interface PostsState {
  posts: IPost[];
  loading: boolean;
  error: string | null;
}