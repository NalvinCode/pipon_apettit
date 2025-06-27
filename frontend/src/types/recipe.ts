// src/types/recipe.ts
export interface Ingrediente {
  nombre: string;
  cantidad: string;
  unidad?: string;
}

export interface PasoReceta {
  orden: number;
  descripcion: string;
  media?: string[];
  tiempoEstimado?: number;
}

export interface Receta {
  id?: number;
  nombre: string;
  descripcion: string;
  porciones: number;
  tiempoPreparacion?: number;
  dificultad?: 'facil' | 'medio' | 'dificil';
  tipo: string;
  ingredientes: Ingrediente[];
  pasos: PasoReceta[];
  fotos?: string[];
  usuario?: {
    id: number;
    alias: string;
    nombre: string;
  };
  valoracion?: {
    promedio: number;
    cantidad: number;
  };
  comentarios?: Comentario[];
  fechaCreacion?: string;
  fechaModificacion?: string;
  estado?: 'borrador' | 'pendiente' | 'publicada' | 'rechazada';
  esLocal?: boolean;
}

export interface Comentario {
  id: number;
  usuario: {
    id: number;
    alias: string;
  };
  puntos: number;
  comentario: string;
  fecha: string;
  autorizado: boolean;
}

export interface RecetaEscalada {
  recetaOriginal: Receta;
  porciones: number;
  ingredientes: Ingrediente[];
  factorEscala: number;
}

export interface FiltrosReceta {
  nombre?: string;
  tipo?: string;
  ingrediente?: string;
  excluir?: string;
  usuario?: number;
  tiempoPreparacion?: number;
  valoracionMin?: number;
  orden?: 'fecha' | 'usuario' | 'alfabetico' | 'valoracion';
  limite?: number;
  offset?: number;
}