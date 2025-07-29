// User types
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Entry types
export interface Entry {
  id: number;
  title: string;
  type: "Movie" | "TV";
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

// Form types
export interface CreateEntryForm {
  title: string;
  type: "Movie" | "TV";
  director: string;
  budget: string;
  location: string;
  duration: string;
  yearTime: string;
  imageUrl?: string;
}

export interface UpdateEntryForm extends Partial<CreateEntryForm> {
  isReleased?: boolean;
}

// Auth types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
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

// Upload types
export interface UploadResponse {
  url: string;
  publicId: string;
}
