import { useState, useCallback } from 'react';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import JoinForm from './components/JoinForm';
import ChatRoom from './components/ChatRoom';
import { useDarkMode } from './components/DarkModeToggle';

function AppContent() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [showChat, setShowChat] = useState(false);
  const { joinRoom } = useSocket();
  const { isDark, toggle } = useDarkMode();

  const handleJoin = useCallback(
    (user, roomId) => {
      setUsername(user);
      setRoom(roomId);
      joinRoom(roomId, user);
      setShowChat(true);
    },
    [joinRoom]
  );

  const handleLeave = useCallback(() => {
    setShowChat(false);
    setUsername('');
    setRoom('');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
      {showChat ? (
        <ChatRoom
          username={username}
          room={room}
          onLeave={handleLeave}
          isDark={isDark}
          onToggleDark={toggle}
        />
      ) : (
        <JoinForm onJoin={handleJoin} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}
