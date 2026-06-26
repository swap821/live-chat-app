import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

export function useOnlineUsers(room) {
  const { socket } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket || !room) return;

    const handleUserJoined = (data) => {
      setOnlineUsers((prev) => {
        const exists = prev.some((u) => (u.username || u) === data.username);
        if (exists) return prev;
        return [...prev, data];
      });
    };

    const handleUserLeft = (data) => {
      setOnlineUsers((prev) =>
        prev.filter((u) => (u.username || u) !== data.username)
      );
    };

    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);

    return () => {
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  }, [socket, room]);

  return onlineUsers;
}
