import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generarJWT, verificarJWT, AuthenticatedRequest } from '../utils/jwt';
import { sendErrorResponse, ErrorTypes, sendSuccessResponse } from '../types/errorTypes';
import { Receta } from '../models/Receta';
import Valoracion from '../models/Valoracion';
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
            usuario: user?.id, // Asignar el usuario autenticado
            fechaCreacion: new Date(),
        });

        await nuevaReceta.save();

        sendSuccessResponse(res, "Receta creada", nuevaReceta);
    } catch (error) {
        console.error('Error al crear receta:', error);
        sendErrorResponse(res, error as Error, 'Error al crear la receta', 500);
    }
}

export const obtenerRecetaPorId = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Validar ID de receta
        if (!id) {
            ErrorTypes.MISSING_FIELDS;
            return;
        }

        const receta = await Receta.findById(id).populate('usuario', 'nombre email');

        if (!receta) {
            return sendErrorResponse(res, new Error('Receta no encontrada'), 'Receta no encontrada', 404);
        }

        const user = await User.findById(receta.usuario);

        const recetaFormateada: RecetaType = {
            id: receta._id.toString(),
            nombre: receta.nombre,
            porciones: receta.porciones ?? 1, // Default to 1 if undefined or null
            descripcion: receta.descripcion ?? '',
            ingredientes: receta.ingredientes.map((ingrediente: Ingrediente) => ({
                nombre: ingrediente.nombre,
                cantidad: ingrediente.cantidad ?? 1,
                unidad: ingrediente.unidad
            })),
            pasos: receta.pasos.map((paso: Paso) => ({
                orden: paso.orden,
                descripcion: paso.descripcion ?? '',
                media: paso.media ?? []
            })),
            media: receta.media,
            usuario: user?.get('nombre') ?? '',
            fechaCreacion: receta.fechaCreacion,
            tiempo: receta.tiempo ?? 0,
            valoracionPromedio: receta.valoracionPromedio ?? 0
        };

        sendSuccessResponse(res, "Receta obtenida", recetaFormateada);
    } catch (error) {
        console.error('Error al obtener receta por ID:', error);
        sendErrorResponse(res, error as Error, 'Error al obtener la receta', 500);
    }
}

export const listarUltimasRecetas = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const recetas = await Receta.find()
            .sort({ fechaCreacion: -1 })
            .limit(10)
            .populate('usuario', 'nombre')

        const recetasFormateadas: RecetaType[] = await Promise.all(recetas.map(async receta => {
            const user = await User.findById(receta.usuario);
            return {
                id: receta._id.toString(),
                nombre: receta.nombre,
                porciones: receta.porciones ?? 1, // Default to 1 if undefined or null
                descripcion: receta.descripcion ?? '',
                ingredientes: receta.ingredientes.map((ingrediente) => ({
                    nombre: ingrediente.nombre,
                    cantidad: ingrediente.cantidad ?? 1, // Default to 1 if undefined or null
                    unidad: ingrediente.unidad
                })),
                pasos: receta.pasos.map((paso) => ({
                    orden: paso.orden,
                    descripcion: paso.descripcion ?? '',
                    media: paso.media ?? []
                })),
                media: receta.media,
                usuario: user?.get('nombre') ?? '',
                fechaCreacion: receta.fechaCreacion,
                tiempo: receta.tiempo ?? 0,
                valoracionPromedio: receta.valoracionPromedio ?? 0
            };
        }));

        sendSuccessResponse(res, "Últimas recetas obtenidas exitosamente", recetasFormateadas);
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

export const valorarReceta = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { puntuacion, comentario } = req.body;
        const { id } = req.params;

        // Validar que la puntuación esté en el rango correcto
        if (puntuacion < 1 || puntuacion > 5) {
            return sendErrorResponse(res, new Error('Puntuación inválida'), 'La puntuación debe estar entre 1 y 5', 400);
        }

        // Buscar la receta
        const receta = await Receta.findById(id);
        if (!receta) {
            return sendErrorResponse(res, new Error('Receta no encontrada'), 'Receta no encontrada', 404);
        }

        // Verificar que el usuario no esté valorando su propia receta
        if (receta.usuario.toString() === req.usuario?.id) {
            return sendErrorResponse(res, new Error('No autorizado'), 'No puedes valorar tu propia receta', 403);
        }

        const user = await User.findById(req.usuario?.id);
        if (!user) {
            return sendErrorResponse(res, new Error('Usuario no encontrado'), 'Usuario no encontrado', 404);
        }

        // Verificar si el usuario ya valoró esta receta
        const valoracionExistente = await Valoracion.findOne({
            receta: id,
            usuario: user.id
        });

        let valoracion;
        
        if (valoracionExistente) {
            // Actualizar valoración existente
            valoracionExistente.puntuacion = puntuacion;
            valoracionExistente.comentario = comentario;
            valoracionExistente.fechaCreacion = new Date();
            valoracion = await valoracionExistente.save();
        } else {
            // Crear nueva valoración
            valoracion = new Valoracion({
                receta: id,
                usuario: user.id,
                puntuacion,
                comentario,
                fechaCreacion: new Date()
            });
            await valoracion.save();
        }

        // Calcular y actualizar el promedio de valoraciones
        const valoraciones = await Valoracion.find({ receta: id });
        const totalValoraciones = valoraciones.length;
        const sumaValoraciones = valoraciones.reduce((suma, val) => suma + val.puntuacion, 0);
        const nuevoPromedio = totalValoraciones > 0 ? sumaValoraciones / totalValoraciones : 0;

        // Actualizar la receta con el nuevo promedio
        await Receta.findByIdAndUpdate(id, {
            valoracionPromedio: Math.round(nuevoPromedio * 10) / 10 // Redondear a 1 decimal
        });

        // Popular la valoración con los datos del usuario para la respuesta
        await valoracion.populate('usuario', 'nombre email');

        sendSuccessResponse(res, valoracionExistente ? "Valoración actualizada" : "Valoración agregada", {
            valoracion,
            nuevoPromedio: Math.round(nuevoPromedio * 10) / 10,
            totalValoraciones
        });

    } catch (error) {
        console.error('Error al valorar receta:', error);
        sendErrorResponse(res, error as Error, 'Error al valorar receta', 500);
    }
}