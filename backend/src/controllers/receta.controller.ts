import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generarJWT, verificarJWT, AuthenticatedRequest } from '../utils/jwt';
import { sendErrorResponse, ErrorTypes, sendSuccessResponse } from '../types/errorTypes';
import { Receta } from '../models/Receta';
import Valoracion from '../models/Valoracion';
import Categoria from '../models/Categoria'
import Usuario from '../models/User'
import { Receta as RecetaType, Paso, Ingrediente, Valoracion as ValoracionType, Categoria as CategoriaType, RecetaSearchFilters, PaginatedRequest } from '../types';
import { buildPaginatedResponse } from '../utils/pagination';

export const formatearReceta = async (receta: any): Promise<RecetaType> => {

    const user = await User.findById(receta.usuario);

    return {
        id: receta._id.toString(),
        nombre: receta.nombre,
        porciones: receta.porciones ?? 1,
        descripcion: receta.descripcion ?? '',
        ingredientes: receta.ingredientes.map((ingrediente: any) => ({
            nombre: ingrediente.nombre,
            cantidad: ingrediente.cantidad ?? 1,
            unidad: ingrediente.unidad,
        })),
        pasos: receta.pasos.map((paso: any) => ({
            orden: paso.orden,
            descripcion: paso.descripcion ?? '',
            media: paso.media ?? [],
        })),
        media: receta.media,
        usuario: user?.get('nombre') ?? '',
        fechaCreacion: receta.fechaCreacion,
        tiempo: receta.tiempo ?? 0,
        valoracionPromedio: receta.valoracionPromedio ?? 0,
    };
};

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
        const { id } = req.query;

        // Validar ID de receta
        if (!id) {
            ErrorTypes.MISSING_FIELDS;
            return;
        }

        const receta = await Receta.findById(id).populate('usuario', 'nombre email');

        if (!receta) {
            return sendErrorResponse(res, new Error('Receta no encontrada'), 'Receta no encontrada', 404);
        }

        const user = await User.findById(req.usuario?.id)
            .lean();

        let recetaFormateada = await formatearReceta(receta);

        const favorito = user?.favoritos.some(fav => fav.equals(receta._id));

        recetaFormateada = { ...recetaFormateada, favorito }

        return sendSuccessResponse(res, "Receta obtenida", recetaFormateada);
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

        const recetasFormateadas = await Promise.all(recetas.map(receta => formatearReceta(receta)));

        sendSuccessResponse(res, "Últimas recetas obtenidas exitosamente", recetasFormateadas);
    } catch (error) {
        console.error('Error al listar últimas recetas:', error);
        sendErrorResponse(res, error as Error, 'Error al listar las últimas recetas', 500);
    }
}

export const buscarRecetas = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const {
            texto,
            autor,
            categorias,
            ingrediente,
            incluirIngrediente,
            tiempoPreparacion,
            valoracion,
            page,
            limit,
        } = req.query as RecetaSearchFilters;

        // Validar y parsear parámetros de paginación
        const pageStr = page || 1;
        const limitStr = limit || 10;

        const currentPage = Math.max(1, pageStr);
        const itemsPerPage = Math.min(100, Math.max(1, limitStr)); // máximo 100 items
        const skip = (currentPage - 1) * itemsPerPage;

        // Construir filtros dinámicamente
        const filtros: Record<string, any> = {};

        // 1. Búsqueda por texto (nombre o descripción)
        if (texto) {
            filtros.$or = [
                { nombre: { $regex: texto, $options: 'i' } },
                { descripcion: { $regex: texto, $options: 'i' } }
            ];
        }

        // 2. Búsqueda por autor
        if (autor) {
            const usuarios = await Usuario.find({
                nombre: { $regex: autor, $options: 'i' }
            }).select('_id');

            if (usuarios.length > 0) {
                filtros.usuario = { $in: usuarios.map(u => u._id) };
            } else {
                // No hay usuarios que coincidan, devolver resultado vacío
                res.json(buildPaginatedResponse([], currentPage, itemsPerPage, 0));
                return;
            }
        }

        // 3. Búsqueda por categorías
        if (categorias) {
            filtros['categorias.nombre'] = { $in: categorias };
        }

        // 4. Búsqueda por ingredientes
        if (ingrediente) {
            // Crear RegExp para búsqueda case-insensitive
            const regexIngrediente = new RegExp(ingrediente, 'i');

            if (incluirIngrediente) {
                // Debe incluir el ingrediente
                filtros['ingredientes.nombre'] = regexIngrediente;
            } else {
                // No debe incluir el ingrediente
                filtros['ingredientes.nombre'] = { $not: regexIngrediente };
            }
        }

        // 5. Filtro por tiempo de preparación (menor o igual)
        if (tiempoPreparacion) {
            filtros.tiempo = { $lte: tiempoPreparacion };
        }

        // 6. Filtro por valoración mínima
        if (valoracion) {
            filtros.valoracionPromedio = { $gte: valoracion };
        }

        // Obtener total de documentos que coinciden con los filtros
        const total = await Receta.countDocuments(filtros);

        // Ejecutar la query con paginación
        const recetas = await Receta.find(filtros)
            .populate('usuario', 'nombre email')
            .populate('categorias', 'nombre')
            .sort({ fechaCreacion: -1 }) // Ordenar por más recientes
            .skip(skip)
            .limit(itemsPerPage)
            .lean(); // Para mejor performance

        const recetasFormateadas = await Promise.all(recetas.map(receta => formatearReceta(receta)));

        // Construir respuesta paginada
        const response = buildPaginatedResponse(recetasFormateadas, currentPage, itemsPerPage, total);

        res.json(response);

    } catch (error) {
        console.error('Error al listar últimas recetas:', error);
        sendErrorResponse(res, error as Error, 'Error al listar las últimas recetas', 500);
    }
};


export const valorarReceta = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { puntuacion, comentario } = req.body;
        const { id } = req.query;

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

        sendSuccessResponse(res, valoracionExistente ? "Valoración actualizada" : "Valoración agregada", { valoracion });

    } catch (error) {
        console.error('Error al valorar receta:', error);
        sendErrorResponse(res, error as Error, 'Error al valorar receta', 500);
    }
}

export const crearCategoria = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            ErrorTypes.MISSING_FIELD("nombre");
            return
        }

        const categoria = await Categoria.findOne({ nombre })

        if (categoria) {
            return sendErrorResponse(res, new Error('Error al crear Categoria'), 'Categoria ya existente', 500);
        }

        let newCategoria = new Categoria({
            nombre
        })

        newCategoria = await newCategoria.save();

        sendSuccessResponse(res, "Categoria creada", {
            newCategoria
        });

    } catch (error) {
        console.error('Error al crear categoria:', error);
        sendErrorResponse(res, error as Error, 'Error al crear Categoria', 500);
    }
}


export const listarCategorias = async (req: AuthenticatedRequest, res: Response) => {
    try {

        const categorias = await Categoria.find()

        if (categorias.length === 0) {
            return sendErrorResponse(res, new Error('Error al obtener Categorias'), 'No hay categorias', 404);
        }

        const categoriasFormateadas: CategoriaType[] = categorias.map(categoria => ({
            id: categoria._id.toString(),
            nombre: categoria.nombre
        }))

        sendSuccessResponse(res, "Categorias obtenidas exitosamente", categoriasFormateadas);

    } catch (error) {
        console.error('Error al crear categoria:', error);
        sendErrorResponse(res, error as Error, 'Error al crear Categoria', 500);
    }
}

export const listarValoraciones = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.query;

        const valoraciones = await Valoracion.find({ receta: id })

        const valoracionesFormateadas: ValoracionType[] = await Promise.all(valoraciones.map(async valoracion => {
            const user = await User.findById(valoracion.usuario);
            return {
                id: valoracion._id.toString(),
                receta: valoracion.receta.toString(),
                usuario: user?.nombre || '',
                valoracion: valoracion.puntuacion,
                comentario: valoracion.comentario || '',
                fechaCreacion: valoracion.fechaCreacion
            };
        }));

        sendSuccessResponse(res, "Categorias obtenidas exitosamente", valoracionesFormateadas);

    } catch (error) {
        console.error('Error al crear categoria:', error);
        sendErrorResponse(res, error as Error, 'Error al crear Categoria', 500);
    }
}