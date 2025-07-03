// Interfaz para el payload del JWT
export interface JWTPayload {
  uid: string;
  iat: number;
  exp: number;
}