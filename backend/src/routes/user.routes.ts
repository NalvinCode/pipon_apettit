import express from 'express';
import { Request, Response } from 'express';
import {authenticateToken} from '../utils/jwt';
import {toggleFavorite, listarFavoritos, listarMisRecetas, actualizarClave, obtenerPerfil, actualizarPerfil} from '../controllers/user.controller';

const router = express.Router();

router.get('/obtenerPerfil', authenticateToken, obtenerPerfil)
router.get('/listarFavoritos', authenticateToken, listarFavoritos)
router.get('/listarMisRecetas', authenticateToken, listarMisRecetas)

router.put('/cambiarContrasena', authenticateToken, actualizarClave)
router.put('/toggleFavorite', authenticateToken, toggleFavorite);
router.put('/actualizarPerfil', authenticateToken, actualizarPerfil)

export default router;