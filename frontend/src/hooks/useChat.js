import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';

export function useChat(room, username) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!socket || !room) return;

    setIsLoading(true);

    const handleLoadMessages = (previousMessages) => {
      const formatted = previousMessages.map((msg) => ({
        id: msg._id || msg.id || Math.random().toString(36).slice(2),
        room: msg.room,
        author: msg.author,
        message: msg.message,
        time: msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: msg.reactions || [],
      }));
      setMessages(formatted);
      setIsLoading(false);
    };

    const handleReceiveMessage = (data) => {
      const newMessage = {
        ...data,
        id: data.id || Math.random().toString(36).slice(2),
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on('load_messages', handleLoadMessages);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('load_messages', handleLoadMessages);
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, room]);

  const sendMessage = useCallback(
    (messageText) => {
      if (!socket || !room || !username || !messageText.trim()) return;

      const messageData = {
        room,
        author: username,
        message: messageText.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      socket.emit('send_message', messageData);
    },
    [socket, room, username]
  );

  return {
    messages,
    sendMessage,
    isLoading,
  };
}
