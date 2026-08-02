import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

export const registerSocketHandlers = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    socket.on('join-room', (room: string) => {
      socket.join(room);
    });

    socket.on('notify-admin', (payload) => {
      io.to('admin-room').emit('admin-notification', payload);
    });

    socket.on('notify-student', (payload) => {
      io.to('student-room').emit('student-notification', payload);
    });
  });

  return io;
};
