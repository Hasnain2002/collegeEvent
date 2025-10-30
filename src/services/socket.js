import { Server } from 'socket.io';

let ioInstance = null;

export function initSocket(server, clientOrigin) {
  const io = new Server(server, {
    cors: { origin: clientOrigin, credentials: true },
  });

  io.on('connection', (socket) => {
    socket.on('announce', (message) => {
      io.emit('announcement', { message, at: Date.now() });
    });
  });

  ioInstance = io;
  return io;
}

// Function to send notification to all connected clients
// In a real app, you'd want to target specific users
export function sendNotification(notification) {
  if (ioInstance) {
    ioInstance.emit('notification', notification);
  }
}


