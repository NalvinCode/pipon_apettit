// src/types/index.ts

import { NavigatorScreenParams } from "@react-navigation/native";

// Tipos base para respuestas de API
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

export interface PaginatedRequest {
  page?: number;
  limit?: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

// Tipos de autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
}

export interface UserData {
  nombre: string;
  email: string;
  bio: string;
}

export interface Ingrediente {
  nombre: string;
  cantidad: Number;
  unidad: string;
}

export interface Paso {
  orden: number;
  descripcion: string;
  media: string[];
}

export interface Receta {
  id: string;
  nombre: string;
  porciones: number;
  descripcion: string;
  ingredientes: Ingrediente[];
  pasos: Paso[];
  categorias: Categoria[];
  media: string[];
  usuario: string;
  fechaCreacion: Date;
  tiempo: number;
  valoracionPromedio?: number;
  favorito?: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
}

export interface Valoracion {
  id: string;
  receta: string;
  usuario: string;
  puntuacion: number;
  comentario: string;
  fechaCreacion?: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
}

export interface PerfilData {
  nombre: string;
  email: string;
  bio:string;
}

export interface AuthResponse{
  usuario: AuthUser;
  token: string;
}

export interface RecuperarClaveData {
  email: string;
}

export interface VerificarCodigoData {
  email: string;
  codigo: string;
}

export interface ActualizarClaveData {
  email?: string;
  codigo?: string;
  claveActual?: string;
  nuevaClave: string;
}

export interface ActualizarPerfilData {
  nombre: string;
  email: string;
  bio: string;
}

export interface RecetaSearchFilters extends PaginatedRequest{
  texto?: string;
  autor?: string;
  categorias?: string[];
  ingredientes?: string[];
  incluirIngredientes?: boolean;
  tiempoPreparacion?: number;
  valoracion?: number;
}

// Tipos de navegación
export type AuthStackParamList = {
  Login: undefined;
  NuevaClave: { email: string; codigo: string };
  RecuperarClave: undefined;
  VerificarCodigo: { email: string };
  token: { value: string };
};

export type BrowseStackParamList = {
  Index: undefined;
  Categorias: undefined;
  BusquedaAvanzada: undefined;
  ResultadoBusqueda: { query: RecetaSearchFilters};
};

export type RecipeStackParamList = {
  RecipeDetail: {recipeId: string; recipe?: Receta };
  CreateRecipe: undefined;
  CreateReview: {recipeId?: string, recipeName: string}
};

export type ProfileStackParamList = {
  UserProfile: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Browse: NavigatorScreenParams<BrowseStackParamList>;
  Recipe: NavigatorScreenParams<RecipeStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};