import { createContext, useContext } from 'react';
import type { FlashMessageType } from '../types';

interface ContextHandleContextType {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showFlash: boolean;
  setShowFlash: React.Dispatch<React.SetStateAction<boolean>>;
  flashMessage: FlashMessageType;
  setFlashMessage: React.Dispatch<React.SetStateAction<FlashMessageType>>;
}

export const ContextHandleContext = createContext<ContextHandleContextType | undefined>(undefined);

export const useContextHandle = (): ContextHandleContextType => {
  const context = useContext(ContextHandleContext);
  if (!context) {
    throw new Error('useContextHandle must be used within a ContextHandleProvider');
  }
  return context;
};
