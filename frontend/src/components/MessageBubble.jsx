import { useState } from 'react';

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name) {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
    'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
    'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function MessageBubble({
  author,
  message,
  time,
  isMe,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flex gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse self-end' : 'flex-row self-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isMe && (
        <div
          className={`w-8 h-8 rounded-full ${getAvatarColor(author)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1 select-none`}
          title={author}
        >
          {getInitials(author)}
        </div>
      )}

      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5 ml-1">
            {author}
          </span>
        )}

        <div
          className={`relative px-4 py-2.5 rounded-2xl shadow-sm transition-shadow ${
            isMe
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-bl-md'
          } ${isHovered ? 'shadow-md' : ''}`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </p>

          <span
            className={`text-[10px] mt-1 block ${
              isMe
                ? 'text-blue-100 text-right'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}
