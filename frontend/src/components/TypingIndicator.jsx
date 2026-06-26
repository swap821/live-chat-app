export default function TypingIndicator({ typingUsers }) {
  if (typingUsers.length === 0) return null;

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing`
      : typingUsers.length === 2
        ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
        : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 self-start">
      <div className="flex gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 italic">
        {text}
      </span>
    </div>
  );
}
