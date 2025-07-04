import express from 'express';
import { Router } from 'express';
import { Request, Response } from 'express';
import {authenticateToken} from '../utils/jwt';
import { 
    loginUsuario, 
    registrarUsuario, 
    recuperarClave, 
    verificarCodigo, 
    actualizarClave
} from '../controllers/auth.controller';


const router = Router();

router.post('/login', loginUsuario);
router.post('/registro', registrarUsuario);
router.post('/recuperar-clave', recuperarClave);
router.post('/verificar-codigo', verificarCodigo);
router.post('/actualizar-clave', authenticateToken , actualizarClave);

export default router;
