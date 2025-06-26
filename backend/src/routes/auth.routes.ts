import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { generarJWT } from '../utils/jwt';
import User from '../models/User';
import {registrarUsuario, loginUsuario} from '../controllers/auth.controller';


const router = express.Router();

router.post('/login', loginUsuario);
router.post('/registro', registrarUsuario);
router.post('/recuperar-clave', (req, res) => {});

export default router;
