import { useState, useRef, useCallback } from 'react';
import EmojiPicker from './EmojiPicker';

export default function ChatInput({ onSend, onTyping }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setMessage('');
    inputRef.current?.focus();
  }, [message, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    onTyping();
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="relative px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-end gap-2">
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
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
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        {showEmojiPicker && (
          <EmojiPicker
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-full border-0 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
      />

      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full transition-colors flex-shrink-0"
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
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  );
}
