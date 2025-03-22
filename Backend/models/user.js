const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ObjectId } = mongoose.Types;

const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => new ObjectId().toString() },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' }
  },
  role: { type: String, default: 'customer' },
  cart: [{
    farmerId: { type: String, required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantityInKg: { type: Number, required: true },
    pricePerKg: { type: Number, required: true }
  }],
  orders: [{
    id: { type: String, default: () => new ObjectId().toString() },
    farmerId: { type: String, required: true },
    products: [{
      productId: { type: String, required: true },
      name: { type: String, required: true },
      quantityInKg: { type: Number, required: true },
      pricePerKg: { type: Number, required: true },
      totalPrice: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'shipped', 'delivered', 'cancelled'], 
      default: 'pending' 
    },
    orderedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

// Pre-save hook to hash password (if provided) and update timestamp
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    const bcrypt = require('bcrypt');
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);