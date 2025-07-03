// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { AuthenticatedRequest, generarJWT, verificarJWT } from '../utils/jwt';
import { sendErrorResponse, ErrorTypes, sendSuccessResponse } from '../types/errorTypes';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// Interfaz para el payload del token de recuperación
interface RecoveryTokenPayload {
  userId: string;
  email: string;
  recuperacion: boolean;
  iat: number;
  exp: number;
}

export const registrarUsuario = async (req: Request, res: Response) => {
  const { email, nombre, password } = req.body;

  try {
    // Verificar si ya existe
    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ 
        success: false,
        message: 'El usuario ya existe',
        data: null
      });
    }

    // Crear usuario
    const user = new User({ email, nombre, password });

    // Encriptar contraseña
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(password, salt);

    await user.save();

    // Generar JWT
    const token = await generarJWT(user.id);

    // ✅ Formato consistente con el frontend
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        usuario: {
          id: user.id,
          nombre: user.nombre,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      data: null
    });
  }
};

export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
        data: null
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas',
        data: null
      });
    }

    const passwordValido = bcrypt.compareSync(password, user.password);

    // Comparar contraseña encriptada
    if (!passwordValido) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas',
        data: null
      });
    }

    const token = await generarJWT(user._id.toString());

    // ✅ Formato que espera el frontend
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario: {
          id: user.id,
          nombre: user.nombre,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      data: null
    });
  }
};

export const recuperarClave = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validar que el email esté presente
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido',
        data: null
      });
    }

    // Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido',
        data: null
      });
    }

    // Verificar si el usuario existe en la base de datos
    const usuario = await User.findOne({ email: email });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'No existe una cuenta con este email',
        data: null
      });
    }

    // Generar código de 4 dígitos
    const codigoRecuperacion = Math.floor(1000 + Math.random() * 9000).toString();

    // Guardar el código en la base de datos con tiempo de expiración (15 minutos)
    const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await User.findByIdAndUpdate(usuario._id, {
      codigoRecuperacion: codigoRecuperacion,
      codigoExpiracion: fechaExpiracion
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail', // o tu proveedor de email
      auth: {
        user: process.env.EMAIL_USER, // tu email
        pass: process.env.EMAIL_PASS  // tu contraseña de aplicación
      }
    });

    // Contenido del email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Pipon Appetit - Código de Recuperación',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FFE4D6; padding: 20px; text-align: center;">
            <h1 style="color: #FF6B35; margin: 0;">Pipon Appetit</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333;">Recuperación de Contraseña</h2>
            <p>Hola ${usuario.nombre},</p>
            <p>Has solicitado recuperar tu contraseña. Usa el siguiente código de 4 dígitos:</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #FF6B35; font-size: 32px; margin: 0; letter-spacing: 8px;">${codigoRecuperacion}</h1>
            </div>
            <p><strong>Este código expira en 15 minutos.</strong></p>
            <p>Si no solicitaste esta recuperación, ignora este email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Equipo de Pipon Appetit<br>
              Este es un email automático, no responder.
            </p>
          </div>
        </div>
      `
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    // ✅ Respuesta exitosa en formato consistente
    res.status(200).json({
      success: true,
      message: 'Código de recuperación enviado exitosamente',
      data: {
        email: email,
        mensaje: 'Revisa tu bandeja de entrada y spam',
        expiraEn: '15 minutos'
      }
    });

  } catch (error) {
    console.error('Error en recuperar clave:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar código de recuperación',
      data: null
    });
  }
};

export const verificarCodigo = async (req: Request, res: Response) => {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({
        success: false,
        message: 'Email y código son requeridos',
        data: null
      });
    }

    const usuario = await User.findOne({ email: email });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: null
      });
    }

    // Verificar si el código existe y no ha expirado
    if (!usuario.codigoRecuperacion || !usuario.codigoExpiracion) {
      return res.status(400).json({
        success: false,
        message: 'No hay código de recuperación activo',
        data: null
      });
    }

    if (new Date() > usuario.codigoExpiracion) {
      return res.status(400).json({
        success: false,
        message: 'El código ha expirado. Solicita uno nuevo',
        data: null
      });
    }

    if (usuario.codigoRecuperacion !== codigo) {
      return res.status(400).json({
        success: false,
        message: 'Código incorrecto',
        data: null
      });
    }

    // Código válido - generar token temporal para cambio de contraseña
    const tokenTemporal = await generarJWT(usuario._id.toString());

    // Limpiar el código usado
    await User.findByIdAndUpdate(usuario._id, {
      $unset: {
        codigoRecuperacion: 1,
        codigoExpiracion: 1
      }
    });

    // ✅ Respuesta en formato consistente
    res.status(200).json({
      success: true,
      message: 'Código verificado exitosamente',
      data: {
        token: tokenTemporal,
        email: email,
        mensaje: 'Procede a cambiar tu contraseña'
      }
    });

  } catch (error) {
    console.error('Error en verificar código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar código',
      data: null
    });
  }
};

export const actualizarClave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nuevaClave } = req.body;

    if (!nuevaClave) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña es requerida',
        data: null
      });
    }

    // Validar fortaleza de la contraseña
    if (nuevaClave.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
        data: null
      });
    }

    // Validación adicional de contraseña (opcional pero recomendada)
    const validacion = validarFortalezaPassword(nuevaClave);
    if (!validacion.valida) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña no cumple con los requisitos de seguridad',
        data: {
          errores: validacion.errores
        }
      });
    }

    // Encriptar la nueva contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(nuevaClave, saltRounds);

    // Actualizar la contraseña en la base de datos
    await User.findByIdAndUpdate(
      req.usuario?.id,
      {
        password: hashedPassword,
        // Limpiar cualquier código de recuperación restante
        $unset: {
          codigoRecuperacion: 1,
          codigoExpiracion: 1
        },
        // Actualizar fecha de modificación
        updatedAt: new Date()
      },
      { new: true }
    );

    // ✅ Respuesta exitosa en formato consistente
    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
      data: {
        email: req.usuario?.email,
        mensaje: 'Ya puedes iniciar sesión con tu nueva contraseña'
      }
    });

  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar contraseña',
      data: null
    });
  }
};

// Método alternativo que también valida la contraseña actual (para cambio desde perfil)
export const cambiarClaveConActual = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { claveActual, nuevaClave, confirmarClave } = req.body;

    // Obtener usuario del token de sesión (middleware de autenticación)
    const userId = req.usuario?.id;

    // Validaciones
    if (!claveActual || !nuevaClave || !confirmarClave) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos',
        data: null
      });
    }

    if (nuevaClave !== confirmarClave) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden',
        data: null
      });
    }

    if (nuevaClave.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
        data: null
      });
    }

    // Buscar usuario
    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: null
      });
    }

    // Verificar contraseña actual
    const claveValida = await bcrypt.compare(claveActual, usuario.password);
    if (!claveValida) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta',
        data: null
      });
    }

    // Verificar que la nueva contraseña sea diferente
    const mismaPassword = await bcrypt.compare(nuevaClave, usuario.password);
    if (mismaPassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe ser diferente a la actual',
        data: null
      });
    }

    // Validar fortaleza
    const validacion = validarFortalezaPassword(nuevaClave);
    if (!validacion.valida) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña no cumple con los requisitos de seguridad',
        data: {
          errores: validacion.errores
        }
      });
    }

    // Encriptar y guardar nueva contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(nuevaClave, saltRounds);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    // ✅ Respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Contraseña cambiada exitosamente',
      data: {
        email: usuario.email,
        mensaje: 'Tu contraseña ha sido actualizada'
      }
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      data: null
    });
  }
};

// ✅ Endpoint adicional para verificar token (útil para el frontend)
export const verificarToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.usuario?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        data: null
      });
    }

    const usuario = await User.findById(userId).select('-password');
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Token válido',
      data: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email
        }
      }
    });

  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar token',
      data: null
    });
  }
};

// Utilidad para validar fortaleza de contraseña
export const validarFortalezaPassword = (password: string): { valida: boolean; errores: string[] } => {
  const errores: string[] = [];

  if (password.length < 6) {
    errores.push('Debe tener al menos 6 caracteres');
  }

  if (!/[a-z]/.test(password)) {
    errores.push('Debe contener al menos una letra minúscula');
  }

  if (!/[A-Z]/.test(password)) {
    errores.push('Debe contener al menos una letra mayúscula');
  }

  if (!/\d/.test(password)) {
    errores.push('Debe contener al menos un número');
  }

  // Solo como recomendación, no obligatorio
  if (!/[@$!%*?&]/.test(password)) {
    errores.push('Se recomienda incluir un caracter especial (@$!%*?&)');
  }

  return {
    valida: errores.filter(e => !e.includes('recomienda')).length === 0,
    errores
  };
};

// ✅ Tipos TypeScript para las respuestas (para consistency)
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface AuthResponseData {
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
  token: string;
}

export interface RecoveryResponseData {
  email: string;
  mensaje: string;
  expiraEn?: string;
}

export interface VerificationResponseData {
  token: string;
  email: string;
  mensaje: string;
}