import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const validarJWT = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('x-token');

  if (!token) {
    res.status(401).json({ msg: 'No hay token en la petición' });
    return;
  }

  try {
    const { uid } = jwt.verify(token, process.env.JWT_SECRET!) as { uid: string };
    (req as any).uid = uid;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token no válido' });
  }
};
