import { Request } from "express";
import { User } from "@prisma/client";

// User type without password for auth middleware
export type UserWithoutPassword = Omit<User, "password">;

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user?: UserWithoutPassword;
}

// Auth types
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

// Entry types
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

// Search and filter types
export interface SearchFilters {
  query?: string;
  type?: "Movie" | "TV";
  year?: string;
  director?: string;
  page?: number;
  limit?: number;
}

// Upload types
export interface UploadResponse {
  url: string;
  publicId: string;
}

// API Response types
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
