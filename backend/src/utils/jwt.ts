import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ErrorTypes } from '../types/errorTypes';
import User from '../models/User';
import { JWTPayload } from '../types/jwtTypes';
import { AuthUser} from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'pipon_app_key';

export interface AuthenticatedRequest extends Request {
  usuario?: AuthUser;
}


// Método para verificar token y retornar el payload
export const verificarJWT = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ErrorTypes.TOKEN_EXPIRED();
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw ErrorTypes.UNAUTHORIZED();
    } else {
      throw ErrorTypes.VALIDATION_ERROR('Error al validar el token');
    }
  }
};

// Middleware para autenticar rutas protegidas
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw ErrorTypes.VALIDATION_ERROR('Token de autorización requerido');
    }

    // Verificar formato "Bearer TOKEN"
    if (!authHeader.startsWith('Bearer ')) {
      throw ErrorTypes.VALIDATION_ERROR('Formato de token inválido. Use: Bearer <token>');
    }

    // Extraer el token
    const token = authHeader.substring(7); // Remover "Bearer "

    if (!token) {
      throw ErrorTypes.UNAUTHORIZED();
    }

    // Verificar el token
    const decoded = verificarJWT(token);

    // Verificar que el usuario aún existe en la base de datos
    const usuario = await User.findById(decoded.uid);
    if (!usuario) {
      throw ErrorTypes.USER_NOT_FOUND();
    }

    // Agregar información del usuario al request
    req.usuario = {
      id: usuario._id.toString(),
      email: usuario.email,
      nombre: usuario.nombre
    };

    next();
  } catch (error) {
    // Usar el sistema de manejo de errores
    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as any).statusCode
      : 401;

    res.status(statusCode).json({
      success: false,
      msg: error instanceof Error ? error.message : 'Token inválido'
    });
  }
};

// Middleware opcional que no falla si no hay token (para rutas públicas con funcionalidad extra si está logueado)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        const decoded = verificarJWT(token);
        const usuario = await User.findById(decoded.uid);

        if (usuario) {
          req.usuario = {
            id: usuario._id.toString(),
            email: usuario.email,
            nombre: usuario.nombre
          };
        }
      }
    }

    next();
  } catch (error) {
    // En el middleware opcional, ignoramos errores de token y continuamos
    next();
  }
};

// Método para renovar token (refresh)
export const renovarJWT = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.usuario?.id) {
      throw ErrorTypes.UNAUTHORIZED();
    }

    // Verificar que el usuario aún existe
    const usuario = await User.findById(req.usuario.id);
    if (!usuario) {
      throw ErrorTypes.USER_NOT_FOUND();
    }

    // Generar nuevo token
    const nuevoToken = generarJWT(req.usuario.id);

    res.status(200).json({
      success: true,
      msg: 'Token renovado exitosamente',
      data: {
        token: nuevoToken,
        usuario: {
          id: usuario._id,
          email: usuario.email,
          nombre: usuario.nombre
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al renovar token'
    });
  }
};

// Método para validar token sin middleware (útil para validaciones manuales)
export const validarTokenManual = (token: string): { valido: boolean; usuario?: string; error?: string } => {
  try {
    const decoded = verificarJWT(token);
    return {
      valido: true,
      usuario: decoded.uid
    };
  } catch (error) {
    return {
      valido: false,
      error: error instanceof Error ? error.message : 'Token inválido'
    };
  }
};

// Método para extraer token de diferentes fuentes
export const extraerToken = (req: Request): string | null => {
  // 1. Header Authorization
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Query parameter (para casos especiales como WebSocket)
  const tokenQuery = req.query.token as string;
  if (tokenQuery) {
    return tokenQuery;
  }

  // 3. Cookie (si usas cookies)
  const tokenCookie = req.cookies?.token;
  if (tokenCookie) {
    return tokenCookie;
  }

  return null;
};

// Exportar también el método generarJWT original
export const generarJWT = (uid: string): string => {
  const payload = { uid };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Exportar también el método generarJWT original
export const generarJWTemp = (uid: string): string => {
  const payload = { uid };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' });
};