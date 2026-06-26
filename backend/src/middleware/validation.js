/**
 * Validation utilities for socket event payloads.
 * Pure functions - no dependencies on external libraries.
 */

const MAX_ROOM_LENGTH = 100;
const MAX_USERNAME_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_EMOJI_LENGTH = 10;
const VALID_ROOM_REGEX = /^[a-zA-Z0-9-_]+$/;
const VALID_USERNAME_REGEX = /^[\w\s-]{1,50}$/;
const VALID_MESSAGE_REGEX = /^(?!\s*$)[\s\S]{1,2000}$/;

/**
 * Generic validation result type.
 * @typedef {{ isValid: boolean, value?: any, error?: string }} ValidationResult
 */

/**
 * Sanitize a string input - trim and strip HTML-like content.
 * @param {string} input
 * @returns {string}
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Strip < and > to prevent HTML injection
    .slice(0, 2000);
};

/**
 * Validate room identifier.
 * @param {any} room
 * @returns {ValidationResult}
 */
export const validateRoom = (room) => {
  if (!room || typeof room !== 'string') {
    return { isValid: false, error: 'Room is required and must be a string' };
  }

  const sanitized = sanitizeString(room);

  if (sanitized.length === 0) {
    return { isValid: false, error: 'Room cannot be empty' };
  }

  if (sanitized.length > MAX_ROOM_LENGTH) {
    return { isValid: false, error: `Room name cannot exceed ${MAX_ROOM_LENGTH} characters` };
  }

  return { isValid: true, value: sanitized };
};

/**
 * Validate username.
 * @param {any} username
 * @returns {ValidationResult}
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required' };
  }

  const sanitized = sanitizeString(username);

  if (sanitized.length === 0) {
    return { isValid: false, error: 'Username cannot be empty' };
  }

  if (sanitized.length > MAX_USERNAME_LENGTH) {
    return { isValid: false, error: `Username cannot exceed ${MAX_USERNAME_LENGTH} characters` };
  }

  return { isValid: true, value: sanitized };
};

/**
 * Validate message content.
 * @param {any} message
 * @returns {ValidationResult}
 */
export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message is required' };
  }

  const sanitized = sanitizeString(message);

  if (sanitized.length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    return { isValid: false, error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters` };
  }

  return { isValid: true, value: sanitized };
};

/**
 * Validate complete send_message payload.
 * @param {any} data
 * @returns {ValidationResult}
 */
export const validateSendMessagePayload = (data) => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid payload format' };
  }

  const roomValidation = validateRoom(data.room);
  if (!roomValidation.isValid) {
    return roomValidation;
  }

  const authorValidation = validateUsername(data.author);
  if (!authorValidation.isValid) {
    return authorValidation;
  }

  const messageValidation = validateMessage(data.message);
  if (!messageValidation.isValid) {
    return messageValidation;
  }

  const time = data.time && typeof data.time === 'string'
    ? data.time.slice(0, 20)
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    isValid: true,
    value: {
      room: roomValidation.value,
      author: authorValidation.value,
      message: messageValidation.value,
      time,
    },
  };
};

/**
 * Validate typing indicator payload.
 * @param {any} data
 * @returns {ValidationResult}
 */
export const validateTypingPayload = (data) => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid payload format' };
  }

  const roomValidation = validateRoom(data.room);
  if (!roomValidation.isValid) {
    return roomValidation;
  }

  const authorValidation = validateUsername(data.author);
  if (!authorValidation.isValid) {
    return authorValidation;
  }

  return {
    isValid: true,
    value: {
      room: roomValidation.value,
      author: authorValidation.value,
    },
  };
};

/**
 * Validate reaction payload.
 * @param {any} data
 * @returns {ValidationResult}
 */
export const validateReactionPayload = (data) => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid payload format' };
  }

  const roomValidation = validateRoom(data.room);
  if (!roomValidation.isValid) {
    return roomValidation;
  }

  if (!data.messageId || typeof data.messageId !== 'string') {
    return { isValid: false, error: 'Message ID is required' };
  }

  if (!data.emoji || typeof data.emoji !== 'string') {
    return { isValid: false, error: 'Emoji is required' };
  }

  const sanitizedEmoji = sanitizeString(data.emoji);

  if (sanitizedEmoji.length === 0 || sanitizedEmoji.length > MAX_EMOJI_LENGTH) {
    return { isValid: false, error: 'Invalid emoji' };
  }

  const authorValidation = validateUsername(data.author);
  if (!authorValidation.isValid) {
    return authorValidation;
  }

  return {
    isValid: true,
    value: {
      room: roomValidation.value,
      messageId: data.messageId,
      emoji: sanitizedEmoji,
      author: authorValidation.value,
    },
  };
};
