import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};

export const joinProject = (projectId: string) => {
  getSocket().emit('join_project', projectId);
};

export const leaveProject = (projectId: string) => {
  getSocket().emit('leave_project', projectId);
};
