// src/context/NetworkContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { NetworkStatus } from '@/types';

interface NetworkState extends NetworkStatus {
  isOnline: boolean;
  canUploadRecipes: boolean; // Solo con WiFi gratis según la consigna
}

type NetworkAction =
  | { type: 'SET_NETWORK_STATUS'; payload: NetworkStatus }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean };

interface NetworkContextType extends NetworkState {
  refreshNetworkStatus: () => Promise<void>;
  checkCanUpload: () => boolean;
}

const initialState: NetworkState = {
  isConnected: false,
  isWifiConnected: false,
  isCellularConnected: false,
  hasInternetAccess: false,
  isOnline: false,
  canUploadRecipes: false,
};

const networkReducer = (state: NetworkState, action: NetworkAction): NetworkState => {
  switch (action.type) {
    case 'SET_NETWORK_STATUS':
      const { isConnected, isWifiConnected, isCellularConnected, hasInternetAccess } = action.payload;
      return {
        ...state,
        isConnected,
        isWifiConnected,
        isCellularConnected,
        hasInternetAccess,
        isOnline: isConnected && hasInternetAccess,
        // Solo puede subir recetas con WiFi (asumiendo que WiFi es gratis)
        canUploadRecipes: isWifiConnected && hasInternetAccess,
      };
    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload,
      };
    default:
      return state;
  }
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(networkReducer, initialState);

  useEffect(() => {
    // Suscribirse a cambios de estado de red
    const unsubscribe = NetInfo.addEventListener(state => {
      const networkStatus: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isWifiConnected: state.type === 'wifi' && state.isConnected === true,
        isCellularConnected: state.type === 'cellular' && state.isConnected === true,
        hasInternetAccess: state.isInternetReachable ?? false,
      };

      dispatch({ type: 'SET_NETWORK_STATUS', payload: networkStatus });
    });

    // Obtener estado inicial
    refreshNetworkStatus();

    return unsubscribe;
  }, []);

  const refreshNetworkStatus = async () => {
    try {
      const state = await NetInfo.fetch();
      
      const networkStatus: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isWifiConnected: state.type === 'wifi' && state.isConnected === true,
        isCellularConnected: state.type === 'cellular' && state.isConnected === true,
        hasInternetAccess: state.isInternetReachable ?? false,
      };

      dispatch({ type: 'SET_NETWORK_STATUS', payload: networkStatus });
    } catch (error) {
      console.error('Error fetching network status:', error);
    }
  };

  const checkCanUpload = (): boolean => {
    // Según la consigna: solo subir con conexión sin cargo (WiFi)
    return state.isWifiConnected && state.hasInternetAccess;
  };

  const value: NetworkContextType = {
    ...state,
    refreshNetworkStatus,
    checkCanUpload,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};