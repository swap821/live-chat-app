import { useEffect, useRef, useCallback } from 'react';

export function useNotifications(enabled = true) {
  const permissionRef = useRef('default');

  useEffect(() => {
    if (!enabled) return;

    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        permissionRef.current = perm;
      });
    }
  }, [enabled]);

  const showNotification = useCallback(
    (title, options = {}) => {
      if (!enabled) return;

      if (document.hidden && permissionRef.current === 'granted') {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'chat-message',
          requireInteraction: false,
          ...options,
        });
      }
    },
    [enabled]
  );

  return {
    showNotification,
  };
}
