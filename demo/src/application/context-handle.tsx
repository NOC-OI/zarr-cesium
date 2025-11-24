import React, { type ReactNode, useEffect, useState } from 'react';
import { ContextHandleContext } from './use-context';

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
        setFlashMessage
      }}
    >
      {children}
    </ContextHandleContext.Provider>
  );
};
