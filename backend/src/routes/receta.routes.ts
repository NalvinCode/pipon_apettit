import express from 'express';
import { Request, Response } from 'express';
import {authenticateToken} from '../utils/jwt';
import { crearReceta, listarUltimasRecetas, obtenerRecetaPorId, valorarReceta, crearCategoria, listarCategorias, listarValoraciones, buscarRecetas} from '../controllers/receta.controller';

const router = express.Router();

router.post('/', (req, res) => { });

router.get('/obtener', authenticateToken, obtenerRecetaPorId);
router.post('/crear', authenticateToken, crearReceta);
router.get('/ultimas', authenticateToken, listarUltimasRecetas);
router.get('/buscar', authenticateToken, buscarRecetas);
router.get('/categorias', authenticateToken, listarCategorias);
router.get('/valoraciones', authenticateToken, listarValoraciones);
router.get('/pendientes', (req, res) => { });


router.post('/valorar', authenticateToken, valorarReceta);
router.post('/crearCategoria', authenticateToken, crearCategoria);


export default router;