import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export const useSocket = (host) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketIo = io(host);
    setSocket(socketIo);

    return () => {
      if (socketIo) socketIo.disconnect();
    };
  }, [host]);

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', roomId);
    }
  };

  const joinGroup = (groupId) => {
    if (socket) {
      socket.emit('join_group', groupId);
    }
  };

  const sendMessage = (message) => {
    if (socket) {
      socket.emit('send_message', message);
    }
  };

  return { socket, joinRoom, joinGroup, sendMessage };
};
