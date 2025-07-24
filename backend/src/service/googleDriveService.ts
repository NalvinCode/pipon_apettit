// backend/src/services/googleDriveService.ts
import { google } from 'googleapis';
import { Auth } from 'googleapis';
import fs from 'fs';
import path from 'path';

interface DriveUploadResult {
  fileId: string;
  fileName: string;
  publicUrl: string;
  webViewLink: string;
}

interface DriveFileInfo {
  id: string;
  name: string;
  size?: string;
  createdTime: string;
  mimeType: string;
  webViewLink: string;
}

class GoogleDriveService {
  private auth: Auth.GoogleAuth;
  private drive: any;
  private imagesFolderId: string | null;

  constructor() {
    // Usar las mismas credenciales que ya tienes para Gmail
    this.auth = new google.auth.GoogleAuth({
      keyFile: "process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE",
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    });
    
    this.drive = google.drive({ version: 'v3', auth: this.auth });
    this.imagesFolderId = process.env.GOOGLE_DRIVE_IMAGES_FOLDER_ID || null;
  }

  // Inicializar y crear carpeta si no existe
  async initialize(): Promise<void> {
    try {
      if (!this.imagesFolderId) {
        // Crear carpeta "Pipon-Appetit-Images" en Drive
        const folderMetadata = {
          name: 'Pipon-Appetit-Images',
          mimeType: 'application/vnd.google-apps.folder',
          parents: ['root']
        };

        const folder = await this.drive.files.create({
          resource: folderMetadata,
          fields: 'id'
        });

        this.imagesFolderId = folder.data.id;
        console.log(`📁 Carpeta creada en Google Drive: ${this.imagesFolderId}`);
        
        // Hacer la carpeta pública para lectura
        await this.drive.permissions.create({
          fileId: this.imagesFolderId,
          resource: {
            role: 'reader',
            type: 'anyone'
          }
        });
      }
    } catch (error) {
      console.error('Error inicializando Google Drive:', error);
      throw error;
    }
  }

  // Subir imagen a Google Drive
  async uploadImage(
    filePath: string, 
    fileName: string, 
    mimeType: string = 'image/jpeg'
  ): Promise<DriveUploadResult> {
    try {
      await this.initialize();

      if (!this.imagesFolderId) {
        throw new Error('No se pudo inicializar la carpeta de imágenes');
      }

      const fileMetadata = {
        name: fileName,
        parents: [this.imagesFolderId]
      };

      const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath)
      };

      // Subir archivo
      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink,webContentLink'
      });

      const fileId: string = response.data.id;

      // Hacer el archivo público
      await this.drive.permissions.create({
        fileId: fileId,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });

      // Obtener la URL pública directa
      const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

      console.log(`✅ Imagen subida a Google Drive: ${fileName}`);

      return {
        fileId,
        fileName,
        publicUrl,
        webViewLink: response.data.webViewLink
      };

    } catch (error) {
      console.error('Error subiendo imagen a Google Drive:', error);
      throw error;
    }
  }

  // Eliminar imagen de Google Drive
  async deleteImage(fileId: string): Promise<boolean> {
    try {
      await this.drive.files.delete({
        fileId: fileId
      });

      console.log(`🗑️ Imagen eliminada de Google Drive: ${fileId}`);
      return true;

    } catch (error) {
      console.error('Error eliminando imagen de Google Drive:', error);
      throw error;
    }
  }

  // Obtener información de archivo
  async getFileInfo(fileId: string): Promise<DriveFileInfo> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id,name,size,createdTime,mimeType,webViewLink'
      });

      return response.data as DriveFileInfo;

    } catch (error) {
      console.error('Error obteniendo info de archivo:', error);
      throw error;
    }
  }

  // Listar imágenes de recetas
  async listImages(): Promise<DriveFileInfo[]> {
    try {
      await this.initialize();

      if (!this.imagesFolderId) {
        throw new Error('No se pudo inicializar la carpeta de imágenes');
      }

      const response = await this.drive.files.list({
        q: `'${this.imagesFolderId}' in parents and trashed=false`,
        fields: 'files(id,name,size,createdTime,webViewLink)',
        orderBy: 'createdTime desc'
      });

      return response.data.files as DriveFileInfo[];

    } catch (error) {
      console.error('Error listando imágenes:', error);
      throw error;
    }
  }

  // Extraer fileId de URL pública
  extractFileIdFromUrl(publicUrl: string): string | null {
    const match = publicUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }
}

export default new GoogleDriveService();