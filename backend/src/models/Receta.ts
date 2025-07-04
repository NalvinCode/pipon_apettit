import { time, timeStamp } from 'console';
import mongoose from 'mongoose';

export const recetaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  porciones: Number,
  descripcion: String,
  ingredientes: [{
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true },
    unidad: { type: String, required: true, enum: ['gr', 'kg', 'ud', 'cda', 'cdta'],  }
  }],
  pasos: [{
    descripcion: { type: String, required: true },
    orden: { type: Number, required: true },
    media: [String]
  }],
  categorias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' }],
  media: [String],
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fechaCreacion: { type: Date, default: Date.now },
  tiempo: { type: Number, default: 0 },
  valoracionPromedio: { type: Number, default: 0 }
},
  {
    timestamps: true,
  });

export const Receta = mongoose.model('Receta', recetaSchema);