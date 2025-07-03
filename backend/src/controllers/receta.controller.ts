import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generarJWT, verificarJWT, AuthenticatedRequest} from '../utils/jwt';
import { sendErrorResponse, ErrorTypes, sendSuccessResponse } from '../types/errorTypes';
import { Receta } from '../models/Receta';
import { Receta as RecetaType, Paso, Categoria, Ingrediente } from '../types';

export const crearReceta = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { nombre, porciones, descripcion, ingredientes, pasos, categorias, media } = req.body;

        // Validar campos requeridos
        if (!nombre || !descripcion || !ingredientes || !pasos) {
            ErrorTypes.MISSING_FIELDS;
            return;
        }

        const user = await User.findById(req.usuario?.id);

        // Crear nueva receta
        const nuevaReceta = new Receta({
            nombre,
            porciones,
            descripcion,
            ingredientes,
            pasos,
            categorias,
            media,
            usuario: user?.get('_id'), // Asignar el usuario autenticado
            fechaCreacion: new Date(),
        });

        await nuevaReceta.save();

        sendSuccessResponse(res, "Receta creada", nuevaReceta);
    } catch (error) {
        console.error('Error al crear receta:', error);
        sendErrorResponse(res, error as Error, 'Error al crear la receta', 500);
    }
}

export const listarUltimasRecetas = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const recetas = await Receta.find()
            .sort({ fechaCreacion: -1 })
            .limit(10)
            .populate('usuario', 'nombre')

        const recetasFormateadas : RecetaType[] = await Promise.all(recetas.map(async receta => {
            const user = await User.findById(receta.usuario);
            return {
                id: receta._id.toString(),
                nombre: receta.nombre,
                porciones: receta.porciones ?? 1, // Default to 1 if undefined or null
                descripcion: receta.descripcion ?? '',
                ingredientes: receta.ingredientes.map((ingrediente) => ({
                    nombre: ingrediente.nombre,
                    cantidad: ingrediente.cantidad ?? 1, // Default to 1 if undefined or null
                })),
                pasos: receta.pasos.map((paso) => ({
                    orden: paso.orden,
                    descripcion: paso.descripcion ?? '',
                    media: paso.media ?? []
                })),
                media: receta.media,
                usuario: user?.get('nombre') ?? '',
                fechaCreacion: receta.fechaCreacion
            };
        }));

        sendSuccessResponse(res, "Últimas recetas obtenidas exitosamente", {
            recetas: recetasFormateadas,
            total: recetasFormateadas.length
        });
    } catch (error) {
        console.error('Error al listar últimas recetas:', error);
        sendErrorResponse(res, error as Error, 'Error al listar las últimas recetas', 500);
    }
}

export const buscarReceta = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { query } = req.query;

        if (!query) {
            return ErrorTypes.MISSING_FIELDS;
        }

        const recetas = await Receta.find({
            $or: [
                { nombre: new RegExp(query as string, 'i') },
                { descripcion: new RegExp(query as string, 'i') },
                { ingredientes: new RegExp(query as string, 'i') }
            ]
        }).populate('usuario', 'nombre email');

        sendSuccessResponse(res, "Recetas encontradas", recetas);
    } catch (error) {
        console.error('Error al buscar receta:', error);
        sendErrorResponse(res, error as Error, 'Error al buscar la receta', 500);
    }
}
