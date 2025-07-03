import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticateToken, generarJWT } from '../utils/jwt';
import User from '../models/User';
import {registrarUsuario, loginUsuario, recuperarClave, verificarCodigo, actualizarClave} from '../controllers/auth.controller';


const router = express.Router();

router.post('/login', loginUsuario);
router.post('/registro', registrarUsuario);
router.post('/recuperar-clave', recuperarClave);
router.post('/verificar-codigo', verificarCodigo);
router.post('/actualizar-clave', authenticateToken , actualizarClave);

export default router;
