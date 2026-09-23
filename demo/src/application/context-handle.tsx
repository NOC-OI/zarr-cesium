import React, { type ReactNode, useEffect, useState } from 'react';
import { ContextHandleContext } from './use-context';
import type { InfoButtonBoxType } from '../types';

interface ContextHandleProviderProps {
  children: ReactNode;
}

export const ContextHandleProvider: React.FC<ContextHandleProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);

  const [showFlash, setShowFlash] = useState(false);
  const [flashMessage, setFlashMessage] = useState({
    messageType: '',
    content: ''
  });
  const [infoButtonBox, setInfoButtonBox] = useState<InfoButtonBoxType>({});
  const [transectLayerName, setTransectLayerName] = useState('');

  useEffect(() => {
    if (flashMessage.messageType) {
      setShowFlash(true);
    }
  }, [flashMessage]);

  return (
    <ContextHandleContext.Provider
      value={{
        loading,
        setLoading,
        showFlash,
        setShowFlash,
        flashMessage,
        setFlashMessage,
        infoButtonBox,
        setInfoButtonBox,
        transectLayerName,
        setTransectLayerName
      }}
    >
      {children}
    </ContextHandleContext.Provider>
  );
};
