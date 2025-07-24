import express from 'express';
import { Request, Response } from 'express';
import {authenticateToken} from '../utils/jwt';
import { 
  uploadMiddleware, 
  uploadImage, 
  deleteImage,
  handleMulterError 
} from '../controllers/upload.controller';

const router = express.Router();

router.post('/subir-imagen', authenticateToken, uploadMiddleware, uploadImage, handleMulterError, );
router.delete('/delete-image', authenticateToken, deleteImage);


export default router;