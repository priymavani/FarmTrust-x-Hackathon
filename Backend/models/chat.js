// models/chat.js
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const chatSchema = new mongoose.Schema({
  _id: { type: String, default: () => new ObjectId().toString() },
  participants: {
    userEmail: { type: String, required: true, ref: 'User' }, // Reference by email
    farmerEmail: { type: String, required: true, ref: 'Farmer' }, // Reference by email
  },
  messages: [{
    sender: {
      type: { type: String, enum: ['customer', 'farmer'], required: true }, // Changed 'user' to 'customer'
      email: { type: String, required: true },
    },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { _id: false });

// Index for efficient lookup by participants
chatSchema.index({ 'participants.userEmail': 1, 'participants.farmerEmail': 1 });

// Pre-save hook to update timestamps
chatSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.isModified('messages') && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].createdAt;
  }
  next();
});

module.exports = mongoose.model('Chat', chatSchema);