import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  codigoRecuperacion: { type: String, default: null },
  codigoExpiracion: { type: Date, default: null },
  favoritos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Receta'}]
});

export default mongoose.model('User', userSchema);