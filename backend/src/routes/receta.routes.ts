import express from 'express';
import { Request, Response } from 'express';
const router = express.Router();
import {authenticateToken} from '../utils/jwt';
import { crearReceta, listarUltimasRecetas} from '../controllers/receta.controller';

router.post('/crear', authenticateToken, crearReceta);
router.get('/ultimas', authenticateToken, listarUltimasRecetas);
router.get('/buscar', (req, res) => { });
router.get('/pendientes', (req, res) => { });
router.get('/:id', (req, res) => { });
router.post('/', (req, res) => { });
router.post('/:id/valorar', (req, res) => { });
router.post('/:id/escalar/guardar', (req, res) => { });

export default router;
