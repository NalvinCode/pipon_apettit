import { Request, Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../utils/jwt';
import { sendErrorResponse, ErrorTypes, sendSuccessResponse } from '../types/errorTypes';
import mongoose from 'mongoose';
import { Receta } from '../models/Receta';
import { formatearReceta } from './receta.controller';
import { validarFortalezaPassword } from './auth.controller';
import bcrypt from 'bcryptjs';

export const obtenerPerfil = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.usuario?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        data: null
      });
      return;
    }

    const user = await User.findById(userId, 'nombre email biografia');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: null
      });
      return;
    }

    const data = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      bio: user.biografia, 
    }

    res.status(200).json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      data
    });

  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener perfil',
      data: null
    });
  }
};

export const listarFavoritos = async (req: AuthenticatedRequest, res: Response) => {
  try {

    const user = await User.findById(req.usuario?.id);

    if (!user) {
      return sendErrorResponse(res, new Error('Usuario no encontrado'), 'Usuario no encontrado', 404);
    }

    const recetasFav = await Receta.find({
      _id: { $in: user.favoritos }
    });

    const recetasFavFormateadas = await Promise.all(recetasFav.map(receta => formatearReceta(receta)));

    return sendSuccessResponse(res, 'Receta agregada a favoritos correctamente!', recetasFavFormateadas);

  } catch (error) {
    console.error('Error al listar recetas favoritas:', error);
    sendErrorResponse(res, error as Error, 'Error al listar recetas favoritas', 500);
  }

}

export const listarMisRecetas = async (req: AuthenticatedRequest, res: Response) => {
  try {

    const user = await User.findById(req.usuario?.id);

    if (!user) {
      return sendErrorResponse(res, new Error('Usuario no encontrado'), 'Usuario no encontrado', 404);
    }

    const misRecetas = await Receta.find({ usuario: user._id });

    const recetasFavFormateadas = await Promise.all(misRecetas.map(receta => formatearReceta(receta)));

    return sendSuccessResponse(res, 'Receta agregada a favoritos correctamente!', recetasFavFormateadas);

  } catch (error) {
    console.error('Error al listar recetas favoritas:', error);
    sendErrorResponse(res, error as Error, 'Error al listar recetas favoritas', 500);
  }
}

export const toggleFavorite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recetaId } = req.query;

    if (!recetaId || typeof recetaId !== 'string') {
      return sendErrorResponse(res, new Error('Falta o es inválido el ID de la receta'), 'Falta o es inválido el ID de la receta', 400);
    }

    const recetaObjectId = new mongoose.Types.ObjectId(recetaId);

    const user = await User.findById(req.usuario?.id);

    if (!user) {
      return sendErrorResponse(res, new Error('Usuario no encontrado'), 'Usuario no encontrado', 404);
    }

    const index = user.favoritos.findIndex(fav => fav.equals(recetaObjectId));

    if (index !== -1) {
      // Ya estaba en favoritos: la quitamos
      user.favoritos.splice(index, 1);
      await user.save();
      return sendSuccessResponse(res, 'Receta eliminada de favoritos correctamente.');
    } else {
      // No estaba: la agregamos
      user.favoritos.push(recetaObjectId);
      await user.save();
      return sendSuccessResponse(res, 'Receta agregada a favoritos correctamente!');
    }

  } catch (error) {
    console.error('Error al hacer toggle de favorito:', error);
    sendErrorResponse(res, error as Error, 'Error al actualizar favoritos', 500);
  }
};

export const actualizarClave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nuevaClave, claveActual } = req.body;

    console.log('Actualizar clave para usuario:', req.usuario?.id);

    // Validar que se proporcionen ambas contraseñas
    if (!claveActual) {
      res.status(400).json({
        success: false,
        message: 'La contraseña actual es requerida',
        data: null
      });
      return;
    }

    if (!nuevaClave) {
      res.status(400).json({
        success: false,
        message: 'La nueva contraseña es requerida',
        data: null
      });
      return;
    }

    // Validar fortaleza de la nueva contraseña
    if (nuevaClave.length < 6) {
      res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
        data: null
      });
      return;
    }

    // Validación adicional de contraseña (opcional pero recomendada)
    const validacion = validarFortalezaPassword(nuevaClave);
    if (!validacion.valida) {
      res.status(400).json({
        success: false,
        message: 'Contraseña no cumple con los requisitos de seguridad',
        data: {
          errores: validacion.errores
        }
      });
      return;
    }

    // Buscar el usuario con la contraseña para verificarla
    const usuario = await User.findById(req.usuario?.id);

    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: null
      });
      return;
    }

    // Verificar que la contraseña actual sea correcta
    const claveActualCorrecta = await bcrypt.compare(claveActual, usuario.password);

    if (!claveActualCorrecta) {
      res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta',
        data: null
      });
      return;
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const mismaContrasena = await bcrypt.compare(nuevaClave, usuario.password);

    if (mismaContrasena) {
      res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe ser diferente a la actual',
        data: null
      });
      return;
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

    const data = {
      email: req.usuario?.email,
      mensaje: 'Ya puedes iniciar sesión con tu nueva contraseña'
    };

    console.log('✅ Contraseña actualizada exitosamente para usuario:', req.usuario?.id);

    sendSuccessResponse(res, 'Contraseña actualizada correctamente', data);

  } catch (error) {
    console.error('❌ Error al actualizar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar contraseña',
      data: null
    });
  }
};

export const actualizarPerfil = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nombre, email, bio } = req.body;
    const userId = req.usuario?.id;

    // Validaciones básicas
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        data: null
      });
      return;
    }

    // Validar que al menos un campo esté presente
    if (!nombre && !email && !bio) {
      res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo para actualizar',
        data: null
      });
      return;
    }

    // Validar formato de email si se proporciona
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Formato de email inválido',
          data: null
        });
        return;
      }

      // Verificar que el email no esté en uso por otro usuario
      const emailExists = await User.findOne({
        email: email,
        _id: { $ne: userId } // Excluir el usuario actual
      });

      if (emailExists) {
        res.status(409).json({
          success: false,
          message: 'El email ya está en uso por otro usuario',
          data: null
        });
        return;
      }
    }

    // Validar longitud del nombre
    if (nombre && (nombre.trim().length < 2 || nombre.trim().length > 50)) {
      res.status(400).json({
        success: false,
        message: 'El nombre debe tener entre 2 y 50 caracteres',
        data: null
      });
      return;
    }

    // Validar longitud de la bio
    if (bio && bio.length > 500) {
      res.status(400).json({
        success: false,
        message: 'La biografía no puede exceder los 500 caracteres',
        data: null
      });
      return;
    }

    // Preparar los datos a actualizar
    const updateData: any = {};
    if (nombre) updateData.nombre = nombre.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (bio !== undefined) updateData.biografia = bio; // Permitir bio vacía

    console.log(updateData)

    // Actualizar el usuario en la base de datos
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: 'nombre email biografia createdAt updatedAt' }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: null
      });
      return;
    }

    const data = {
      id: updatedUser.id,
      nombre: updatedUser.nombre,
      email: updatedUser.email,
      bio: updatedUser.biografia, 
    }

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: data
      }
    });

  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar perfil',
      data: null
    });
  }
};