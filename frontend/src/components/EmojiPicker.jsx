import { useRef, useEffect } from 'react';

const COMMON_EMOJIS = [
  '😀', '😂', '❤️', '👍', '🔥', '😊', '😭', '🎉',
  '😎', '🤔', '👏', '✨', '🙌', '💯', '😍', '😁',
  '😅', '😌', '😬', '🥰', '😘', '👋', '👌', '🙏',
  '😉', '😋', '😮', '😴',
];

export default function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl p-3 z-50"
    >
      <div className="grid grid-cols-7 gap-1.5">
        {COMMON_EMOJIS.map((emoji, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
