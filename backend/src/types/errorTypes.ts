// types/errorTypes.ts
export interface ApiError {
  success: false;
  msg: string;
  error?: string;
  statusCode?: number;
}

export interface ApiSuccess<T = any> {
  success: true;
  msg: string;
  data?: T;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// utils/errorHandler.ts
import { Response } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Función para enviar respuestas de error estandarizadas
export const sendErrorResponse = (
  res: Response, 
  error: Error | AppError, 
  defaultMessage: string = 'Error interno del servidor',
  defaultStatusCode: number = 500
): void => {
  const statusCode = error instanceof AppError ? error.statusCode : defaultStatusCode;
  
  const errorResponse: ApiError = {
    success: false,
    msg: error instanceof AppError ? error.message : defaultMessage,
    statusCode: statusCode
  };

  // Solo incluir detalles del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = error.message;
  }

  console.error(`Error ${statusCode}:`, error);
  res.status(statusCode).json(errorResponse);
};

// Función para enviar respuestas exitosas estandarizadas
export const sendSuccessResponse = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): void => {
  const response: ApiSuccess<T> = {
    success: true,
    msg: message,
    ...(data && { data })
  };

  res.status(statusCode).json(response);
};

// Errores específicos predefinidos
export const ErrorTypes = {
  // Errores de validación (400)
  VALIDATION_ERROR: (message: string) => new AppError(message, 400),
  MISSING_FIELD: (field: string) => new AppError(`El campo ${field} es requerido`, 400),
  MISSING_FIELDS: () => new AppError(`Faltan campos requeridos`, 400),
  INVALID_EMAIL: () => new AppError('Formato de email inválido', 400),
  INVALID_CREDENTIALS: () => new AppError('Credenciales inválidas', 401),
  
  // Errores de autorización (401)
  UNAUTHORIZED: () => new AppError('No autorizado', 401),
  TOKEN_EXPIRED: () => new AppError('Token expirado', 401),
  
  // Errores de recursos no encontrados (404)
  USER_NOT_FOUND: () => new AppError('Usuario no encontrado', 404),
  RESOURCE_NOT_FOUND: (resource: string) => new AppError(`${resource} no encontrado`, 404),
  
  // Errores de conflicto (409)
  USER_ALREADY_EXISTS: () => new AppError('El usuario ya existe', 409),
  EMAIL_ALREADY_USED: () => new AppError('El email ya está en uso', 409),
  
  // Errores de servidor (500)
  DATABASE_ERROR: () => new AppError('Error en la base de datos', 500),
  EMAIL_SEND_ERROR: () => new AppError('Error al enviar email', 500),
  INTERNAL_SERVER_ERROR: () => new AppError('Error interno del servidor', 500)
};

// Middleware para manejo global de errores
export const globalErrorHandler = (
  err: Error | AppError,
  req: any,
  res: Response,
  next: any
): void => {
  sendErrorResponse(res, err);
};

// Wrapper para async functions que automáticamente maneja errores
export const asyncHandler = (fn: Function) => {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};