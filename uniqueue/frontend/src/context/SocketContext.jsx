import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

/**
 * Socket Provider Component
 * Manages Socket.IO connection for real-time updates
 */
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  /**
   * Join a service room for real-time updates
   */
  const joinService = (serviceId) => {
    if (socket) {
      socket.emit('join-service', { serviceId });
      console.log(`Joined service room: service-${serviceId}`);
    }
  };

  /**
   * Leave a service room
   */
  const leaveService = (serviceId) => {
    if (socket) {
      socket.off(`service-${serviceId}`);
    }
  };

  /**
   * Listen for queue updates
   */
  const onQueueUpdate = (callback) => {
    if (socket) {
      socket.on('queue-update', callback);
      return () => socket.off('queue-update', callback);
    }
  };

  /**
   * Listen for token called events
   */
  const onTokenCalled = (callback) => {
    if (socket) {
      socket.on('token-called', callback);
      return () => socket.off('token-called', callback);
    }
  };

  /**
   * Listen for queue status changes
   */
  const onQueueStatusChange = (callback) => {
    if (socket) {
      socket.on('queue-status-change', callback);
      return () => socket.off('queue-status-change', callback);
    }
  };

  /**
   * Listen for notifications
   */
  const onNotification = (callback) => {
    if (socket) {
      socket.on('notification', callback);
      return () => socket.off('notification', callback);
    }
  };

  const value = {
    socket,
    isConnected,
    joinService,
    leaveService,
    onQueueUpdate,
    onTokenCalled,
    onQueueStatusChange,
    onNotification,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Custom hook to use socket context
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
