import { Server } from 'socket.io';

/**
 * Socket.IO service for real-time updates
 * Handles queue updates, notifications, and live status changes
 */
class SocketService {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize Socket.IO server
   * @param {http.Server} server - HTTP server instance
   */
  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket) => {
      console.log(`✅ Socket connected: ${socket.id}`);

      // Join room based on user role
      socket.on('join-room', ({ roomId, role }) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
      });

      // Join service-specific room for real-time queue updates
      socket.on('join-service', ({ serviceId }) => {
        socket.join(`service-${serviceId}`);
        console.log(`User ${socket.id} joined service room: service-${serviceId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`❌ Socket disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  /**
   * Emit event to all clients in a service room
   * @param {string} serviceId - Service ID
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emitToService(serviceId, event, data) {
    if (this.io) {
      this.io.to(`service-${serviceId}`).emit(event, data);
    }
  }

  /**
   * Emit event to all connected clients
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emitToAll(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  /**
   * Emit event to specific room
   * @param {string} room - Room name
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emitToRoom(room, event, data) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  /**
   * Broadcast queue update
   * @param {string} serviceId - Service ID
   * @param {object} queueData - Queue data
   */
  broadcastQueueUpdate(serviceId, queueData) {
    this.emitToService(serviceId, 'queue-update', queueData);
  }

  /**
   * Broadcast token called notification
   * @param {string} serviceId - Service ID
   * @param {object} tokenData - Token data
   */
  broadcastTokenCalled(serviceId, tokenData) {
    this.emitToService(serviceId, 'token-called', tokenData);
    
    // Also emit to all for display screens
    this.emitToAll('token-called', {
      serviceId,
      ...tokenData,
    });
  }

  /**
   * Broadcast service status change
   * @param {string} serviceId - Service ID
   * @param {boolean} isOpen - Queue open status
   */
  broadcastQueueStatus(serviceId, isOpen) {
    this.emitToService(serviceId, 'queue-status-change', {
      serviceId,
      isQueueOpen: isOpen,
    });
  }

  /**
   * Send notification to specific user
   * @param {string} userId - User ID
   * @param {object} notification - Notification data
   */
  sendNotification(userId, notification) {
    this.emitToRoom(`user-${userId}`, 'notification', notification);
  }
}

// Export singleton instance
export default new SocketService();
