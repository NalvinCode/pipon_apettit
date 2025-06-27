// src/types/auth.ts
export interface LoginCredentials {
  email: string;
  password: string;
  guardarCredenciales?: boolean;
}

export interface RegisterData {
  email: string;
  alias: string;
}

export interface CompleteRegistrationData {
  nombre: string;
  apellido: string;
  telefono?: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  codigo: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: number;
  email: string;
  alias: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  tipoUsuario: 'alumno' | 'visitante';
  registroCompleto: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message: string;
}