// backend/src/controllers/imageController.ts
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import googleDriveService from '../service/googleDriveService';

// Interfaces
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

interface UploadImageResponse {
  url: string;
  fileId: string;
  fileName: string;
}

interface DeleteImageRequest {
  imageUrl: string;
}

// Configuración de multer para almacenamiento temporal
const storage = multer.diskStorage({
  destination: async (req: Request, file: Express.Multer.File, cb: Function) => {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    
    // Crear directorio si no existe
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creando directorio:', error);
    }
    
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Generar nombre único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `recipe-${uniqueSuffix}${ext}`);
  }
});

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Validar tipo de archivo
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
  },
});

// Controlador para subir imagen
const uploadImage = async (req: MulterRequest, res: Response): Promise<void> => {
  let tempFilePath: string | null = null;
  
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ninguna imagen'
      } as ApiResponse);
      return;
    }

    tempFilePath = req.file.path;
    const fileName = req.file.filename;
    const mimeType = req.file.mimetype;

    console.log(`📤 Subiendo imagen: ${fileName}`);

    // Subir a Google Drive
    const driveResult = await googleDriveService.uploadImage(
      tempFilePath,
      fileName,
      mimeType
    );

    // Eliminar archivo temporal
    await fs.unlink(tempFilePath);
    tempFilePath = null;

    res.json({
      success: true,
      data: {
        url: driveResult.publicUrl,
        fileId: driveResult.fileId,
        fileName: driveResult.fileName
      } as UploadImageResponse,
      message: 'Imagen subida exitosamente a Google Drive'
    } as ApiResponse<UploadImageResponse>);

  } catch (error: any) {
    console.error('Error uploading image:', error);
    
    // Limpiar archivo temporal si existe
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (unlinkError) {
        console.error('Error eliminando archivo temporal:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor al subir la imagen'
    } as ApiResponse);
  }
};

// Controlador para eliminar imagen
const deleteImage = async (req: Request<{}, {}, DeleteImageRequest>, res: Response): Promise<void> => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        message: 'URL de imagen requerida'
      } as ApiResponse);
      return;
    }

    // Extraer fileId de la URL de Google Drive
    const fileId = googleDriveService.extractFileIdFromUrl(imageUrl);
    
    if (!fileId) {
      res.status(400).json({
        success: false,
        message: 'URL de Google Drive inválida'
      } as ApiResponse);
      return;
    }

    // Eliminar de Google Drive
    await googleDriveService.deleteImage(fileId);

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente de Google Drive'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor al eliminar la imagen'
    } as ApiResponse);
  }
};

// Controlador para obtener información de imagen
const getImageInfo = async (req: Request<{ fileId: string }>, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      res.status(400).json({
        success: false,
        message: 'ID de archivo requerido'
      } as ApiResponse);
      return;
    }

    const fileInfo = await googleDriveService.getFileInfo(fileId);

    res.json({
      success: true,
      data: fileInfo
    } as ApiResponse);

  } catch (error: any) {
    console.error('Error getting image info:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de la imagen'
    } as ApiResponse);
  }
};

// Controlador para listar todas las imágenes
const listImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const images = await googleDriveService.listImages();

    res.json({
      success: true,
      data: images,
      count: images.length
    } as ApiResponse);

  } catch (error: any) {
    console.error('Error listing images:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar imágenes'
    } as ApiResponse);
  }
};

// Middleware para manejo de errores de multer
const handleMulterError = (error: any, req: Request, res: Response, next: NextFunction): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 10MB permitido.'
      } as ApiResponse);
      return;
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        message: 'Tipo de archivo no permitido.'
      } as ApiResponse);
      return;
    }
  }
  
  if (error.message.includes('Solo se permiten imágenes')) {
    res.status(400).json({
      success: false,
      message: error.message
    } as ApiResponse);
    return;
  }

  next(error);
};

// Función para limpiar archivos temporales antiguos
const cleanupTempFiles = async (): Promise<void> => {
  try {
    const tempDir = path.join(__dirname, '../../uploads/temp');
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log(`🧹 Archivo temporal eliminado: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error limpiando archivos temporales:', error);
  }
};

// Ejecutar limpieza cada hora
setInterval(cleanupTempFiles, 60 * 60 * 1000);

// Crear el middleware de upload una sola vez
const uploadMiddleware = upload.single('image');

export {
  uploadMiddleware,
  uploadImage,
  deleteImage,
  getImageInfo,
  listImages,
  handleMulterError
};