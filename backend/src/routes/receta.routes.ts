import express from 'express';
import { Request, Response } from 'express';
import {authenticateToken} from '../utils/jwt';
import { crearReceta, listarUltimasRecetas, obtenerRecetaPorId, valorarReceta} from '../controllers/receta.controller';

const router = express.Router();

router.post('/', (req, res) => { });

router.post('/crear', authenticateToken, crearReceta);
router.get('/ultimas', authenticateToken, listarUltimasRecetas);
router.get('/pendientes', (req, res) => { });
router.get('/buscar', (req, res) => { });


router.post('/:id/valorar', authenticateToken, valorarReceta);
router.post('/:id/escalar/guardar', (req, res) => { });
router.get('/:id', authenticateToken, obtenerRecetaPorId);

export default router;
