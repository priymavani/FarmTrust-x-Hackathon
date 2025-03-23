const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const farmerSchema = new mongoose.Schema({
  _id: { type: String, default: () => new ObjectId().toString() },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  showPhoneToUsers: { type: Boolean, default: false },
  address: { 
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
  },
  description: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  certificates: {
    fssai: { type: String, default: '' }, 
    organicFarm: { type: String, default: '' } 
  },
  deliveryCharge: { type: Number, default: 0 },
  products: [{
    id: { type: String, default: () => new ObjectId().toString() },
    name: { type: String, required: true },
    mrpPerKg: { type: Number, required: true },
    images: { type: [String], default: [] },
    description: { type: String, default: '' },
    category: { type: String, enum: ['fruits', 'vegetables', 'grains'], required: true },
    subcategory: { type: String, required: true },
    stockInKg: { type: Number, required: true },
    rating: {
      totalScore: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      average: { type: Number, default: 0 }
    }
  }],
  farmerRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

farmerSchema.pre('save', function(next) {
  if (this.products.length > 0) {
    const totalProductAverage = this.products.reduce((sum, product) => {
      return sum + (product.rating.average || 0);
    }, 0);
    this.farmerRating = totalProductAverage / this.products.length;
  } else {
    this.farmerRating = 0;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Farmer', farmerSchema);

