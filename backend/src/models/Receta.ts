import mongoose from 'mongoose';

const ingredienteSchema = new mongoose.Schema({
  nombre: String,
  cantidad: String
});

const pasoSchema = new mongoose.Schema({
  orden: Number,
  descripcion: String,
  media: [String]
});

const recetaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  porciones: Number,
  descripcion: String,
  ingredientes: [ingredienteSchema],
  pasos: [pasoSchema],
  modo: { type: String, enum: ['nuevo', 'reemplazo', 'edicion'] },
  requiereWifiGratis: Boolean
});

export default mongoose.model('Receta', recetaSchema);
