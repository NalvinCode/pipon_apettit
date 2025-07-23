import express from 'express';
import { Request, Response } from 'express';
import {authenticateToken} from '../utils/jwt';
import {toggleFavorite, listarFavoritos} from '../controllers/user.controller';

const router = express.Router();

router.put('/toggleFavorite', authenticateToken, toggleFavorite);
router.get('/listarFavoritos', authenticateToken, listarFavoritos)

export default router;