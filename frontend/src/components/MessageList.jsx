import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

function formatDateSeparator(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function shouldShowDateSeparator(prevMsg, currMsg) {
  if (!prevMsg || !currMsg) return false;
  const prevTime = prevMsg.time;
  const currTime = currMsg.time;
  if (!prevTime || !currTime) return false;

  const prevDate = new Date();
  const [prevHours, prevMinutes] = prevTime.split(':');
  prevDate.setHours(parseInt(prevHours, 10), parseInt(prevMinutes, 10), 0, 0);

  const currDate = new Date();
  const [currHours, currMinutes] = currTime.split(':');
  currDate.setHours(parseInt(currHours, 10), parseInt(currMinutes, 10), 0, 0);

  const diffMs = Math.abs(currDate - prevDate);
  return diffMs > 60 * 60 * 1000;
}

export default function MessageList({ messages, currentUser, isLoading }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    if (shouldScrollRef.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      shouldScrollRef.current = isNearBottom;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
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
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            No messages yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Be the first to send a message!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 flex flex-col gap-1"
    >
      {messages.map((msg, index) => {
        const prevMsg = index > 0 ? messages[index - 1] : null;
        const showDateSep = shouldShowDateSeparator(prevMsg, msg);

        return (
          <div key={msg.id || index} className="flex flex-col gap-1">
            {showDateSep && (
              <div className="flex items-center gap-3 py-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  {formatDateSeparator(msg.time)}
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            )}
            <MessageBubble
              author={msg.author}
              message={msg.message}
              time={msg.time}
              isMe={currentUser === msg.author}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
