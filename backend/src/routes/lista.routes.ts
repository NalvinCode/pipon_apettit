import express, { Request, Response, NextFunction  } from 'express';
import { validarJWT } from '../middlewares/jwt-validator';

const router = express.Router();

router.get('/', validarJWT, (req: Request, res: Response, next: NextFunction) => {
  const uid = (req as any).uid;
  res.json({ msg: 'Token válido', uid });
});

export default router;