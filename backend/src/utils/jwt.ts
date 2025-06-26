import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pipon_app_key'; // Usá una variable de entorno real en producción

export const generarJWT = (uid: string): string => {
  const payload = { uid };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};
