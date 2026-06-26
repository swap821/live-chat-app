import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';

const TYPING_DEBOUNCE_MS = 2000;

export function useTyping(room, username) {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!socket || !room) return;

    const handleUserTyping = (data) => {
      if (data.author === username) return;
      setTypingUsers((prev) => {
        if (prev.find((u) => u.author === data.author)) return prev;
        return [...prev, { author: data.author, timestamp: Date.now() }];
      });
    };

    const handleUserStopTyping = (data) => {
      setTypingUsers((prev) => prev.filter((u) => u.author !== data.author));
    };

    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStopTyping);

    return () => {
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStopTyping);
    };
  }, [socket, room, username]);

  useEffect(() => {
    if (typingUsers.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) =>
        prev.filter((u) => now - u.timestamp < TYPING_DEBOUNCE_MS + 500)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [typingUsers.length]);

  const emitTyping = useCallback(() => {
    if (!socket || !room || !username) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { room, author: username });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stop_typing', { room, author: username });
    }, TYPING_DEBOUNCE_MS);
  }, [socket, room, username]);

  const emitStopTyping = useCallback(() => {
    if (!socket || !room || !username) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit('stop_typing', { room, author: username });
    }
  }, [socket, room, username]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitStopTyping();
    };
  }, [emitStopTyping]);

  const typingDisplayNames = typingUsers.map((u) => u.author);

  return {
    typingUsers: typingDisplayNames,
    emitTyping,
    emitStopTyping,
  };
}
