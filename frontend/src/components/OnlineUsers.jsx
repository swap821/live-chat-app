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

export default function OnlineUsers({ users, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="flex items-center gap-2 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-colors"
        title="View online users"
      >
        <div className="flex -space-x-2">
          {users.slice(0, 3).map((user, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-full ${getAvatarColor(user.username || user.name || 'User')} flex items-center justify-center text-white text-[10px] font-bold border-2 border-blue-600`}
            >
              {getInitials(user.username || user.name || 'U')}
            </div>
          ))}
          {users.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-blue-600">
              +{users.length - 3}
            </div>
          )}
        </div>
        <span className="text-sm font-medium hidden sm:inline">
          {users.length} online
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-2">
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Online Users
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {users.length} user{users.length !== 1 ? 's' : ''} in this room
              </p>
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {users.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">
                  No users online
                </div>
              ) : (
                users.map((user, idx) => {
                  const name = user.username || user.name || 'Anonymous';
                  const isCurrentUser = name === currentUser;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="relative">
                        <div
                          className={`w-8 h-8 rounded-full ${getAvatarColor(name)} flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {getInitials(name)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {name}
                          {isCurrentUser && (
                            <span className="ml-1.5 text-xs text-blue-500 font-normal">
                              (you)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
