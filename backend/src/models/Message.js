import mongoose from 'mongoose';

/**
 * Reaction subdocument schema for message reactions.
 */
const reactionSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      required: true,
      maxlength: 10,
    },
    users: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { _id: false }
);

/**
 * Message schema with room support and reactions.
 */
const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: [true, 'Room is required'],
      trim: true,
      maxlength: [100, 'Room name cannot exceed 100 characters'],
      index: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [50, 'Author name cannot exceed 50 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient room-based message queries
messageSchema.index({ room: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
