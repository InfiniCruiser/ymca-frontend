'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';

interface SocketContextType {
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Mock WebSocket connection - in a real app, this would connect to a WebSocket server
    setIsConnected(true);
    
    return () => {
      setIsConnected(false);
    };
  }, []);

  const sendMessage = (message: any) => {
    // Mock sending message - in a real app, this would send via WebSocket
    console.log('Sending message:', message);
  };

  return (
    <SocketContext.Provider value={{ isConnected, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
