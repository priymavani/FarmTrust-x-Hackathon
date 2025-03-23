const mongoose = require('mongoose');
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
      enum: ['pending', 'shipped', 'delivered', 'cancelled', 'confirmed'], 
      default: 'pending' 
    },
    orderedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });


module.exports = mongoose.model('User', userSchema);