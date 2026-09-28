import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

let ioInstance = null;

export function initSocketIO(httpServer, corsOrigin) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  // Authentication handshake middleware
  ioInstance.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          socket.user = decoded;
        } catch (err) {
          logger.warn(`Socket auth token invalid, continuing as guest: ${err.message}`);
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  });

  ioInstance.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (user: ${socket.user?.id || 'anonymous'})`);

    // Join user-specific and role-specific rooms
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
      if (socket.user.role) {
        socket.join(`role:${socket.user.role}`);
      }
    }

    // Allow joining specific donation or delivery tracking rooms
    socket.on('join:donation', (donationId) => {
      socket.join(`donation:${donationId}`);
    });

    socket.on('leave:donation', (donationId) => {
      socket.leave(`donation:${donationId}`);
    });

    socket.on('join:delivery', (deliveryId) => {
      socket.join(`delivery:${deliveryId}`);
    });

    socket.on('leave:delivery', (deliveryId) => {
      socket.leave(`delivery:${deliveryId}`);
    });

    // Delivery partner broadcasts live location
    socket.on('delivery:updateLocation', ({ deliveryId, coordinates }) => {
      if (deliveryId && coordinates) {
        ioInstance.to(`delivery:${deliveryId}`).emit('delivery:location', {
          deliveryId,
          coordinates,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

export function emitToUser(userId, event, data) {
  if (ioInstance) {
    ioInstance.to(`user:${userId.toString()}`).emit(event, data);
  }
}

export function emitToRole(role, event, data) {
  if (ioInstance) {
    ioInstance.to(`role:${role}`).emit(event, data);
  }
}

export function emitToAll(event, data) {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
}

export function emitDonationStatus(donationId, donation) {
  if (ioInstance) {
    ioInstance.to(`donation:${donationId.toString()}`).emit('donation:statusChanged', donation);
    ioInstance.emit('donation:updated', donation);
  }
}

export function emitDeliveryStatus(deliveryId, delivery) {
  if (ioInstance) {
    ioInstance.to(`delivery:${deliveryId.toString()}`).emit('delivery:statusChanged', delivery);
    ioInstance.emit('delivery:updated', delivery);
  }
}
