import express from 'express';
import authRoutes from './auth.routes';
import recetaRoutes from './receta.routes';
import userRoutes from './user.routes';

const router = express.Router();

// Health Check
router.get('/', (req, res) => {
    res.status(200).json({ msg: 'OK' });
});

router.use('/auth', authRoutes);
router.use('/recetas', recetaRoutes);
router.use('/user', userRoutes);

export default router;