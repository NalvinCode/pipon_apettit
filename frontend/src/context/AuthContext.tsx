// src/context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

import { 
  AuthUser, 
  LoginCredentials, 
  RegisterData, 
  CompleteRegistrationData,
  ApiResponse 
} from '@/types';
import { authService } from '@/services/api';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasStoredCredentials: boolean;
}

type AuthAction =
  | { type: 'LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_STORED_CREDENTIALS'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: AuthUser };

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  completeRegistration: (data: CompleteRegistrationData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, codigo: string, password: string) => Promise<void>;
  checkStoredCredentials: () => Promise<void>;
  clearStoredCredentials: () => Promise<void>;
  loginWithStoredCredentials: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  hasStoredCredentials: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_STORED_CREDENTIALS':
      return { ...state, hasStoredCredentials: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'LOADING', payload: true });

      // Verificar si hay token almacenado
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');

      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: storedToken } });
      }

      // Verificar credenciales almacenadas
      await checkStoredCredentials();
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      dispatch({ type: 'LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'LOADING', payload: true });

      const response: ApiResponse<{ user: AuthUser; token: string }> = await authService.login(credentials);
      const { user, token } = response.data!;

      // Almacenar token y usuario
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));

      // Si el usuario eligió guardar credenciales, almacenarlas de forma segura
      if (credentials.guardarCredenciales) {
        await Keychain.setCredentials('pipon_appetit', credentials.email, credentials.password);
        dispatch({ type: 'SET_STORED_CREDENTIALS', payload: true });
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    } catch (error) {
      dispatch({ type: 'LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'LOADING', payload: true });

      // Limpiar almacenamiento local
      await AsyncStorage.multiRemove(['auth_token', 'auth_user']);

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      dispatch({ type: 'LOADING', payload: false });
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      
      await authService.register(data);
      
      // El registro exitoso no logea automáticamente según la consigna
      // Solo envía el email de confirmación
    } catch (error) {
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: false });
    }
  };

  const completeRegistration = async (data: CompleteRegistrationData) => {
    try {
      dispatch({ type: 'LOADING', payload: true });

      const response: ApiResponse<{ user: AuthUser; token: string }> = await authService.completeRegistration(data);
      const { user, token } = response.data!;

      // Almacenar token y usuario después del registro completo
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    } catch (error) {
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: false });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      
      await authService.forgotPassword(email);
    } catch (error) {
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: false });
    }
  };

  const resetPassword = async (email: string, codigo: string, password: string) => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      
      await authService.resetPassword({ email, codigo, password, confirmPassword: password });
    } catch (error) {
      throw error;
    } finally {
      dispatch({ type: 'LOADING', payload: false });
    }
  };

  const checkStoredCredentials = async () => {
    try {
      const credentials = await Keychain.getCredentials('pipon_appetit');
      dispatch({ type: 'SET_STORED_CREDENTIALS', payload: !!credentials });
    } catch (error) {
      dispatch({ type: 'SET_STORED_CREDENTIALS', payload: false });
    }
  };

  const clearStoredCredentials = async () => {
    try {
      await Keychain.resetCredentials('pipon_appetit');
      dispatch({ type: 'SET_STORED_CREDENTIALS', payload: false });
    } catch (error) {
      console.error('Error clearing stored credentials:', error);
    }
  };

  const loginWithStoredCredentials = async () => {
    try {
      const credentials = await Keychain.getCredentials('pipon_appetit');
      
      if (credentials) {
        await login({
          email: credentials.username,
          password: credentials.password,
          guardarCredenciales: true,
        });
      }
    } catch (error) {
      console.error('Error logging in with stored credentials:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    completeRegistration,
    forgotPassword,
    resetPassword,
    checkStoredCredentials,
    clearStoredCredentials,
    loginWithStoredCredentials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};