import express from 'express';
import authRoutes from './auth.routes';
import recetaRoutes from './receta.routes';
import listaRoutes from './lista.routes';

const router = express.Router();

// Health Check
router.get('/', (req, res) => {
    res.status(200).json({ msg: 'OK' });
});

router.use('/auth', authRoutes);
router.use('/recetas', recetaRoutes);
router.use('/lista', listaRoutes);

export default router;
