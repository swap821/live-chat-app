import Message from '../models/Message.js';
import logger from '../utils/logger.js';
import {
  validateRoom,
  validateSendMessagePayload,
  validateTypingPayload,
  validateReactionPayload,
} from '../middleware/validation.js';

/**
 * In-memory store for online users.
 * Map<socketId, { username: string, room: string }>
 */
const onlineUsers = new Map();

/**
 * Get the count of users in a specific room.
 */
const getRoomUserCount = (room) => {
  let count = 0;
  for (const user of onlineUsers.values()) {
    if (user.room === room) count++;
  }
  return count;
};

/**
 * Get a list of unique usernames in a room.
 */
const getRoomUsersList = (room) => {
  const users = new Set();
  for (const user of onlineUsers.values()) {
    if (user.room === room) users.add(user.username);
  }
  return Array.from(users);
};

/**
 * Register all chat socket event handlers.
 * @param {import('socket.io').Server} io
 */
export const registerChatSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id} | IP: ${socket.handshake.address}`);

    /**
     * join_room - Add user to a room and send last 50 messages.
     */
    socket.on('join_room', async (data, callback) => {
      try {
        const roomResult = validateRoom(data?.room || data);
        if (!roomResult.isValid) {
          return socket.emit('error_event', { code: 'INVALID_ROOM', message: roomResult.error });
        }

        const room = roomResult.value;
        const username = data?.username?.trim() || 'Anonymous';

        // Leave any previous room
        const currentUser = onlineUsers.get(socket.id);
        if (currentUser?.room && currentUser.room !== room) {
          socket.leave(currentUser.room);
          io.to(currentUser.room).emit('user_left', {
            username: currentUser.username,
            room: currentUser.room,
            usersOnline: getRoomUserCount(currentUser.room),
            usersList: getRoomUsersList(currentUser.room),
          });
          logger.info(`User ${socket.id} left room ${currentUser.room}`);
        }

        // Join new room
        socket.join(room);
        onlineUsers.set(socket.id, { username, room });

        logger.info(`User ${socket.id} (${username}) joined room: ${room}`);

        // Fetch and send last 50 messages
        const roomMessages = await Message.find({ room })
          .sort({ createdAt: 1 })
          .limit(50)
          .lean();

        socket.emit('load_messages', roomMessages);

        // Notify room of new user
        io.to(room).emit('user_joined', {
          username,
          room,
          usersOnline: getRoomUserCount(room),
          usersList: getRoomUsersList(room),
        });

        // Acknowledge to client
        if (typeof callback === 'function') {
          callback({ success: true, room });
        }
      } catch (error) {
        logger.error(`Error in join_room [${socket.id}]: ${error.message}`);
        socket.emit('error_event', { code: 'JOIN_ROOM_FAILED', message: 'Failed to join room' });
      }
    });

    /**
     * send_message - Save message to DB and broadcast to room (including sender).
     */
    socket.on('send_message', async (data, callback) => {
      try {
        const validation = validateSendMessagePayload(data);
        if (!validation.isValid) {
          return socket.emit('error_event', { code: 'INVALID_MESSAGE', message: validation.error });
        }

        const { room, author, message, time } = validation.value;

        const newMessage = new Message({ room, author, message, time });
        const savedMessage = await newMessage.save();

        const messagePayload = {
          id: savedMessage._id.toString(),
          room: savedMessage.room,
          author: savedMessage.author,
          message: savedMessage.message,
          time: savedMessage.time,
          createdAt: savedMessage.createdAt,
          updatedAt: savedMessage.updatedAt,
          reactions: savedMessage.reactions,
        };

        // Emit to ALL users in the room, including sender
        io.to(room).emit('receive_message', messagePayload);

        if (typeof callback === 'function') {
          callback({ success: true, messageId: savedMessage._id.toString() });
        }
      } catch (error) {
        logger.error(`Error in send_message [${socket.id}]: ${error.message}`);
        socket.emit('error_event', { code: 'SEND_MESSAGE_FAILED', message: 'Failed to send message' });
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Failed to send message' });
        }
      }
    });

    /**
     * typing - Broadcast typing indicator to room (excluding sender).
     */
    socket.on('typing', (data) => {
      try {
        const validation = validateTypingPayload(data);
        if (!validation.isValid) return;

        const { room, author } = validation.value;

        // Verify the user is actually in this room
        const user = onlineUsers.get(socket.id);
        if (!user || user.room !== room) return;

        socket.to(room).emit('user_typing', { author, room });
      } catch (error) {
        logger.error(`Error in typing [${socket.id}]: ${error.message}`);
      }
    });

    /**
     * stop_typing - Broadcast stop typing indicator to room.
     */
    socket.on('stop_typing', (data) => {
      try {
        const validation = validateTypingPayload(data);
        if (!validation.isValid) return;

        const { room, author } = validation.value;

        const user = onlineUsers.get(socket.id);
        if (!user || user.room !== room) return;

        socket.to(room).emit('user_stopped_typing', { author, room });
      } catch (error) {
        logger.error(`Error in stop_typing [${socket.id}]: ${error.message}`);
      }
    });

    /**
     * add_reaction - Add or toggle a reaction on a message.
     */
    socket.on('add_reaction', async (data, callback) => {
      try {
        const validation = validateReactionPayload(data);
        if (!validation.isValid) {
          return socket.emit('error_event', { code: 'INVALID_REACTION', message: validation.error });
        }

        const { room, messageId, emoji, author } = validation.value;

        // Verify user is in the room
        const user = onlineUsers.get(socket.id);
        if (!user || user.room !== room) {
          return socket.emit('error_event', { code: 'NOT_IN_ROOM', message: 'You are not in this room' });
        }

        const message = await Message.findById(messageId);
        if (!message) {
          return socket.emit('error_event', { code: 'MESSAGE_NOT_FOUND', message: 'Message not found' });
        }

        // Find existing reaction with this emoji
        const existingReaction = message.reactions.find((r) => r.emoji === emoji);

        if (existingReaction) {
          // Toggle: add user if not present, remove if present
          const userIndex = existingReaction.users.indexOf(author);
          if (userIndex > -1) {
            existingReaction.users.splice(userIndex, 1);
            // Remove the reaction entirely if no users left
            if (existingReaction.users.length === 0) {
              message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
            }
          } else {
            existingReaction.users.push(author);
          }
        } else {
          message.reactions.push({ emoji, users: [author] });
        }

        await message.save();

        io.to(room).emit('reaction_updated', {
          messageId,
          reactions: message.reactions,
          room,
        });

        if (typeof callback === 'function') {
          callback({ success: true, reactions: message.reactions });
        }
      } catch (error) {
        logger.error(`Error in add_reaction [${socket.id}]: ${error.message}`);
        socket.emit('error_event', { code: 'REACTION_FAILED', message: 'Failed to process reaction' });
      }
    });

    /**
     * leave_room - Remove user from room.
     */
    socket.on('leave_room', (room) => {
      try {
        const user = onlineUsers.get(socket.id);
        if (user && user.room === room) {
          socket.leave(room);
          onlineUsers.delete(socket.id);

          io.to(room).emit('user_left', {
            username: user.username,
            room,
            usersOnline: getRoomUserCount(room),
            usersList: getRoomUsersList(room),
          });

          logger.info(`User ${socket.id} left room ${room}`);
        }
      } catch (error) {
        logger.error(`Error in leave_room [${socket.id}]: ${error.message}`);
      }
    });

    /**
     * disconnect - Clean up user data and notify room.
     */
    socket.on('disconnect', (reason) => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        const { username, room } = user;
        onlineUsers.delete(socket.id);

        io.to(room).emit('user_left', {
          username,
          room,
          usersOnline: getRoomUserCount(room),
          usersList: getRoomUsersList(room),
        });

        logger.info(`User disconnected: ${socket.id} (${username}) from room ${room} | Reason: ${reason}`);
      } else {
        logger.info(`User disconnected: ${socket.id} | Reason: ${reason}`);
      }
    });
  });
};

/**
 * Get total count of online users.
 */
export const getTotalOnlineCount = () => onlineUsers.size;
