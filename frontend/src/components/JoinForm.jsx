import { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';

export default function JoinForm({ onJoin }) {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [errors, setErrors] = useState({});
  const { isConnected } = useSocket();

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    else if (username.trim().length < 2)
      newErrors.username = 'Must be at least 2 characters';
    if (!room.trim()) newErrors.room = 'Room ID is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoin = () => {
    if (!validate()) return;
    onJoin(username.trim(), room.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col gap-5 transition-colors">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Join a Chat
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your details to start chatting
          </p>
        </div>

        {!isConnected && (
          <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 text-sm rounded-lg p-3">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span>Connecting to server...</span>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username)
                setErrors((prev) => ({ ...prev, username: '' }));
            }}
            onKeyDown={handleKeyDown}
            className={`w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.username
                ? 'border-red-400 focus:ring-red-500'
                : 'border-gray-200 dark:border-gray-600'
            }`}
          />
          {errors.username && (
            <span className="text-xs text-red-500 mt-0.5">{errors.username}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="room"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Room ID
          </label>
          <input
            id="room"
            type="text"
            placeholder="Enter room ID"
            value={room}
            onChange={(e) => {
              setRoom(e.target.value);
              if (errors.room) setErrors((prev) => ({ ...prev, room: '' }));
            }}
            onKeyDown={handleKeyDown}
            className={`w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.room
                ? 'border-red-400 focus:ring-red-500'
                : 'border-gray-200 dark:border-gray-600'
            }`}
          />
          {errors.room && (
            <span className="text-xs text-red-500 mt-0.5">{errors.room}</span>
          )}
        </div>

        <button
          onClick={handleJoin}
          disabled={!isConnected}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>Join Room</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
