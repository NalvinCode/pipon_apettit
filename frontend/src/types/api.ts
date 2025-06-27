// src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

export interface NetworkStatus {
  isConnected: boolean;
  isWifiConnected: boolean;
  isCellularConnected: boolean;
  hasInternetAccess: boolean;
}

export interface SyncStatus {
  recetasPendientes: number;
  ultimaSync: string | null;
  enProgreso: boolean;
}