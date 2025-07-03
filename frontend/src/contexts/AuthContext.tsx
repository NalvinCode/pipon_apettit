// src/contexts/AuthContext.tsx - Versión React Native
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/auth';
import { 
  LoginCredentials, 
  AuthResponse, 
  RecuperarClaveData, 
  VerificarCodigoData, 
  ActualizarClaveData 
} from '@/types';

// Tipos para el estado de autenticación
export interface User {
  id: string;
  email: string;
  nombre: string;
  rol?: string;
  // Agregar otros campos según tu modelo de usuario
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Tipos para las acciones del reducer
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // true inicialmente para verificar token existente
  error: null,
};

// Reducer para manejar el estado
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Interfaz del contexto
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  recuperarClave: (data: RecuperarClaveData) => Promise<boolean>;
  verificarCodigo: (data: VerificarCodigoData) => Promise<boolean>;
  actualizarClave: (data: ActualizarClaveData) => Promise<boolean>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constantes para AsyncStorage (equivalente a localStorage en React Native)
const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

// Proveedor del contexto
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Función para guardar datos en AsyncStorage
  const saveAuthData = async (user: User, token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      console.log('✅ Datos de auth guardados en AsyncStorage');
    } catch (error) {
      console.error('❌ Error guardando datos de auth:', error);
    }
  };

  // Función para limpiar datos de AsyncStorage
  const clearAuthData = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      console.log('🗑️ Datos de auth eliminados de AsyncStorage');
    } catch (error) {
      console.error('❌ Error limpiando datos de auth:', error);
    }
  };

  // Función para verificar el estado de autenticación al iniciar
  const checkAuthStatus = async (): Promise<void> => {
    try {
      console.log('🔍 Verificando estado de autenticación...');
      
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userStr = await AsyncStorage.getItem(USER_KEY);

      if (token && userStr) {
        const user = JSON.parse(userStr);
        
        console.log('✅ Token encontrado, usuario:', user.nombre);
        
        // Aquí podrías hacer una verificación del token con el backend
        // Por ejemplo: await apiClient.get('/auth/verify-token')
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });
      } else {
        console.log('❌ No hay token guardado');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('❌ Error verificando estado de autenticación:', error);
      await clearAuthData();
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Función de login
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try { 
      console.log('🚀 Iniciando login para:', credentials.email);
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.login(credentials);

      console.log('🔄 Respuesta del servicio de autenticación:', response);
      
      if (response.success && response.data) {
        const { usuario, token } = response.data;
        
        console.log('✅ Login exitoso para:', usuario.nombre);
        
        // Guardar en AsyncStorage
        await saveAuthData(usuario, token);
        
        // Actualizar estado
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: usuario, token }
        });
        
        console.log('🔄 Estado de autenticación actualizado');
        return true;
      } else {
        console.log('❌ Login falló:', response.message);
        dispatch({
          type: 'AUTH_ERROR',
          payload: response.message || 'Error en el login'
        });
        return false;
      }
    } catch (error: any) {
      console.log('❌ Error de conexión en login:', error.message);
      const errorMessage = error.response?.data?.message || 'Error de conexión';
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage
      });
      return false;
    }
  };

  // Función de logout (async para React Native)
  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Cerrando sesión...');
      await clearAuthData();
      dispatch({ type: 'LOGOUT' });
      console.log('✅ Sesión cerrada correctamente');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      // Aunque haya error, forzar logout
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Función para recuperar clave
  const recuperarClave = async (data: RecuperarClaveData): Promise<boolean> => {
    try {
      console.log('📧 Recuperando clave para:', data.email);
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.recuperarClave(data);
      
      if (response.success) {
        console.log('✅ Email de recuperación enviado');
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } else {
        console.log('❌ Error al recuperar clave:', response.message);
        dispatch({
          type: 'AUTH_ERROR',
          payload: response.message || 'Error al recuperar clave'
        });
        return false;
      }
    } catch (error: any) {
      console.log('❌ Error de conexión en recuperar clave:', error.message);
      const errorMessage = error.response?.data?.message || 'Error de conexión';
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage
      });
      return false;
    }
  };

  // Función para verificar código
  const verificarCodigo = async (data: VerificarCodigoData): Promise<boolean> => {
    try {
      console.log('🔢 Verificando código para:', data.email);
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.verificarCodigo(data);
      
      if (response.success) {
        console.log('✅ Código verificado correctamente');
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } else {
        console.log('❌ Código inválido:', response.message);
        dispatch({
          type: 'AUTH_ERROR',
          payload: response.message || 'Código inválido'
        });
        return false;
      }
    } catch (error: any) {
      console.log('❌ Error de conexión en verificar código:', error.message);
      const errorMessage = error.response?.data?.message || 'Error de conexión';
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage
      });
      return false;
    }
  };

  // Función para actualizar clave
  const actualizarClave = async (data: ActualizarClaveData): Promise<boolean> => {
    try {
      console.log('🔑 Actualizando clave para:', data.email);
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.actualizarClave(data);
      
      if (response.success) {
        console.log('✅ Clave actualizada correctamente');
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } else {
        console.log('❌ Error al actualizar clave:', response.message);
        dispatch({
          type: 'AUTH_ERROR',
          payload: response.message || 'Error al actualizar clave'
        });
        return false;
      }
    } catch (error: any) {
      console.log('❌ Error de conexión en actualizar clave:', error.message);
      const errorMessage = error.response?.data?.message || 'Error de conexión';
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage
      });
      return false;
    }
  };

  // Función para limpiar errores
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Debug: Log del estado actual
  useEffect(() => {
    console.log('🔐 Estado Auth actualizado:', {
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      user: state.user?.nombre,
      hasToken: !!state.token,
      error: state.error
    });
  }, [state]);

  // Valor del contexto
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    recuperarClave,
    verificarCodigo,
    actualizarClave,
    clearError,
    checkAuthStatus,
  };  

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// HOC para proteger componentes (adaptado para React Native)
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    // En React Native, usamos componentes nativos en lugar de divs
    if (isLoading) {
      const { View, ActivityIndicator, Text } = require('react-native');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={{ marginTop: 16, color: '#666' }}>Cargando...</Text>
        </View>
      );
    }

    if (!isAuthenticated) {
      const { View, Text } = require('react-native');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#666' }}>Acceso denegado</Text>
        </View>
      );
    }

    return <Component {...props} />;
  };
};

// Hook adicional para debugging (útil durante desarrollo)
export const useAuthDebug = () => {
  const auth = useAuth();
  
  useEffect(() => {
    const debugInfo = {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      hasUser: !!auth.user,
      hasToken: !!auth.token,
      userName: auth.user?.nombre,
      error: auth.error
    };
    
    console.log('🐛 Auth Debug Info:', debugInfo);
  }, [auth]);
  
  return auth;
};

// Funciones utilitarias para manejar AsyncStorage (exportadas para uso opcional)
export const authStorage = {
  // Obtener token guardado
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  },
  
  // Obtener usuario guardado
  getUser: async (): Promise<User | null> => {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  },
  
  // Verificar si hay datos de auth
  hasAuthData: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const user = await AsyncStorage.getItem(USER_KEY);
      return !!(token && user);
    } catch (error) {
      console.error('Error verificando datos de auth:', error);
      return false;
    }
  },
  
  // Limpiar todos los datos de auth
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      console.log('✅ Todos los datos de auth eliminados');
    } catch (error) {
      console.error('❌ Error limpiando datos de auth:', error);
    }
  }
};