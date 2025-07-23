import { Request, Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../utils/jwt';
import { sendErrorResponse, ErrorTypes, sendSuccessResponse } from '../types/errorTypes';
import mongoose from 'mongoose';
import { Receta } from '../models/Receta';
import { formatearReceta } from './receta.controller';

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