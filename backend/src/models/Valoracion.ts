import mongoose from 'mongoose';


const valoracionSchema = new mongoose.Schema({
    receta: { type: mongoose.Schema.Types.ObjectId, ref: 'Receta', required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    valoracion: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, maxlength: 500 },
    fechaCreacion: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.model('Valoracion', valoracionSchema);
