import { useEffect, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { useTyping } from '../hooks/useTyping';
import { useOnlineUsers } from '../hooks/useOnlineUsers';
import { useNotifications } from '../hooks/useNotifications';
import { useSocket } from '../contexts/SocketContext';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import OnlineUsers from './OnlineUsers';
import DarkModeToggle from './DarkModeToggle';

export default function ChatRoom({
  username,
  room,
  onLeave,
  isDark,
  onToggleDark,
}) {
  const { socket, isConnected } = useSocket();
  const { messages, sendMessage, isLoading } = useChat(room, username);
  const { typingUsers, emitTyping, emitStopTyping } = useTyping(
    room,
    username
  );
  const onlineUsers = useOnlineUsers(room);
  const { showNotification } = useNotifications(true);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.author !== username) {
      showNotification(`New message from ${lastMessage.author}`, {
        body: lastMessage.message,
      });
    }
  }, [messages, username, showNotification]);

  const handleSend = useCallback(
    (text) => {
      sendMessage(text);
      emitStopTyping();
    },
    [sendMessage, emitStopTyping]
  );

  const handleTyping = useCallback(() => {
    emitTyping();
  }, [emitTyping]);

  return (
    <div className="w-full max-w-2xl mx-auto h-[100dvh] sm:h-[85vh] sm:rounded-2xl sm:shadow-2xl bg-white dark:bg-gray-800 flex flex-col overflow-hidden transition-colors">
      {/* Header */}
      <header className="flex-shrink-0 bg-blue-600 dark:bg-blue-800 text-white px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onLeave}
            className="sm:hidden w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
            type="button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base truncate">Room: {room}</h2>
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
                title={isConnected ? 'Connected' : 'Disconnected'}
              />
            </div>
            <p className="text-xs text-blue-100 truncate">
              Signed in as <span className="font-medium">{username}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <OnlineUsers users={onlineUsers} currentUser={username} />
          <DarkModeToggle isDark={isDark} onToggle={onToggleDark} />
          <button
            onClick={onLeave}
            className="hidden sm:flex w-9 h-9 items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Leave room"
            type="button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </header>

      <MessageList
        messages={messages}
        currentUser={username}
        isLoading={isLoading}
      />

      <TypingIndicator typingUsers={typingUsers} />

      <ChatInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
}
