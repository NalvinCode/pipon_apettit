// backend/src/controllers/imageController.ts
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import googleDriveService from '../service/googleDriveService';
import { ApiResponse, UploadImageResponse } from '../types';

// Interfaces
interface MulterRequest extends Request {
  file?: Express.Multer.File;
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
  console.log("test")
  let tempFilePath: string | null = null;
  
  try {
    // Validar que se haya recibido un archivo
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
    const fileSize = req.file.size;

    console.log(`📤 Procesando imagen: ${fileName}`);
    console.log(`📊 Tamaño: ${(fileSize / 1024 / 1024).toFixed(2)}MB, Tipo: ${mimeType}`);

    // Validaciones adicionales
    if (fileSize > 10 * 1024 * 1024) { // 10MB
      await fs.unlink(tempFilePath); // Limpiar archivo
      res.status(400).json({
        success: false,
        message: 'La imagen es demasiado grande. Máximo 10MB permitido.'
      } as ApiResponse);
      return;
    }

    // Verificar que el archivo existe
    try {
      await fs.access(tempFilePath);
    } catch (accessError) {
      console.error('Archivo temporal no accesible:', accessError);
      res.status(500).json({
        success: false,
        message: 'Error procesando la imagen'
      } as ApiResponse);
      return;
    }

    console.log(`☁️ Subiendo a Google Drive: ${fileName}`);

    // Subir a Google Drive
    const driveResult = await googleDriveService.uploadImage(
      tempFilePath,
      fileName,
      mimeType
    );

    console.log(`✅ Imagen subida exitosamente: ${driveResult.fileId}`);

    // Eliminar archivo temporal
    try {
      await fs.unlink(tempFilePath);
      console.log(`🧹 Archivo temporal eliminado: ${fileName}`);
      tempFilePath = null;
    } catch (unlinkError) {
      console.warn('No se pudo eliminar archivo temporal:', unlinkError);
      // No es crítico, continuar
    }

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      data: {
        url: driveResult.publicUrl,
        fileId: driveResult.fileId,
        fileName: driveResult.fileName
      } as UploadImageResponse,
      message: 'Imagen subida exitosamente a Google Drive'
    } as ApiResponse<UploadImageResponse>);

  } catch (error: any) {
    console.error('❌ Error uploading image:', error);
    
    // Limpiar archivo temporal si existe
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
        console.log(`🧹 Archivo temporal limpiado tras error: ${tempFilePath}`);
      } catch (unlinkError) {
        console.error('Error eliminando archivo temporal tras fallo:', unlinkError);
      }
    }

    // Determinar tipo de error y respuesta apropiada
    let statusCode = 500;
    let errorMessage = 'Error interno del servidor al subir la imagen';

    if (error.message?.includes('Google Drive')) {
      statusCode = 503; // Service Unavailable
      errorMessage = 'Servicio de almacenamiento temporalmente no disponible';
    } else if (error.message?.includes('credentials') || error.message?.includes('authentication')) {
      statusCode = 500;
      errorMessage = 'Error de configuración del servidor';
      console.error('🔐 Error de credenciales de Google Drive');
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      statusCode = 507; // Insufficient Storage
      errorMessage = 'Límite de almacenamiento alcanzado';
    } else if (error.code === 'ENOENT') {
      statusCode = 400;
      errorMessage = 'Archivo no encontrado o corrupto';
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      // Solo en desarrollo, incluir detalles del error
      ...(process.env.NODE_ENV === 'development' && { 
        debug: {
          originalError: error.message,
          code: error.code,
          stack: error.stack?.split('\n').slice(0, 3).join('\n')
        }
      })
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
  handleMulterError
};