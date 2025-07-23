// src/config/api.ts
export const API_CONFIG = {
  // URL base de la API - cambiar según el entorno
  BASE_URL: __DEV__ 
    ? 'http://192.168.1.4:5000/api/' // Desarrollo local
    : 'https://pipon-apettit.onrender.com/api', // Producción
  
  // Timeout para requests
  TIMEOUT: 10000, // 10 segundos
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Configuración de retry
  RETRY_CONFIG: {
    attempts: 3,
    delay: 1000, // 1 segundo
  },
  
  // Endpoints principales
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/registro',
      FORGOT_PASSWORD: '/auth/recuperar-clave',
      RESET_PASSWORD: '/auth/confirmar-nueva-clave',
      REFRESH_TOKEN: '/auth/refresh',
      LOGOUT: '/auth/logout',
    },
    RECIPES: {
      LIST: '/recetas',
      LATEST: '/recetas/ultimas',
      SEARCH: '/recetas/buscar',
      DETAIL: '/recetas/:id',
      CREATE: '/recetas',
      UPDATE: '/recetas/:id',
      DELETE: '/recetas/:id',
    },
    USER: {
      PROFILE: '/usuarios/perfil',
      LIST: '/lista',
    }
  }
} as const;

// Configuración de storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_TOKEN_TEMP: 'auth_token_temp',
  USER_DATA: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
  APP_SETTINGS: 'app_settings',
} as const;