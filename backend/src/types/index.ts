import { Request } from "express";
import { User } from "@prisma/client";

export type UserWithoutPassword = Omit<User, "password">;

export interface AuthenticatedRequest extends Request {
  user?: UserWithoutPassword;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

export interface CreateEntryRequest {
  title: string;
  type: "Movie" | "TV";
  director: string;
  budget: string;
  location: string;
  duration: string;
  yearTime: string;
  imageUrl?: string;
}

export interface UpdateEntryRequest extends Partial<CreateEntryRequest> {
  isReleased?: boolean;
}

export interface EntryResponse {
  id: number;
  title: string;
  type: string;
  director: string;
  budget: string;
  location: string;
  duration: string;
  yearTime: string;
  imageUrl?: string;
  isReleased: boolean;
  likes: number;
  dislikes: number;
  userId: number;
  user: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query?: string;
  type?: "Movie" | "TV";
  year?: string;
  director?: string;
  page?: number;
  limit?: number;
}

export interface UploadResponse {
  url: string;
  publicId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
