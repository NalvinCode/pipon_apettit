// src/types/user.ts
export interface Usuario {
  id: number;
  email: string;
  alias: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  tipoUsuario: 'alumno' | 'visitante';
  fechaRegistro: string;
  activo: boolean;
}

export interface ListaPersonal {
  id: number;
  usuario: number;
  recetas: number[];
  fechaModificacion: string;
}