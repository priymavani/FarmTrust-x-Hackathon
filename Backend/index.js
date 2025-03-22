const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Farmer = require('./models/farmer');
const User = require('./models/user');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const http = require('http');
const { Server } = require('socket.io');
const Chat = require('./models/chat');


dotenv.config();

const app = express();
const PORT = 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'farmtrust'
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((error) => {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH'],
  credentials: true,
}));
app.use(express.json());


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'productImages' || file.fieldname === 'profilePic') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Product images and profile picture must be image files'));
      }
    } else if (file.fieldname === 'fssaiCert' || file.fieldname === 'organicCert') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Certificates must be PDF files'));
      }
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.post("/chatbot/query", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // 🔹 Only Organic Product Recommendation Logic
    const prompt = `
      You are FarmTrust's helpful assistant. FarmTrust is a trust-driven marketplace connecting farmers directly with consumers. 
      Your task is to recommend only **organic products** like fresh vegetables, seasonal fruits, and grains.

      **Rules for Recommendation:**
      1️⃣ Always suggest only organic products (Vegetables, Fruits, Grains).  
      2️⃣ If the user asks for seasonal produce, include **current seasonal fruits, vegetables, and grains**.  
      3️⃣ If the user asks about farming, focus on **sustainable & organic farming practices**.  
      4️⃣ Do not suggest non-organic items or processed foods.  

      🔹 **User Query:** ${question}  
      🔹 **Provide a response in simple and informative language.**  
    `;

    const result = await model.generateContent(prompt);
    const botResponse =
      result.response.text() || "Sorry, I couldn't generate a response.";

    res.status(200).json({ response: botResponse });
  } catch (error) {
    console.error("Error in chatbot query:", error);
    res.status(500).json({ error: "Failed to process query" });
  }
});

app.post('/farmers', upload.single('profilePic'), async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    let profilePicUrl = '';
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'farmers/profile_pics', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      profilePicUrl = result.secure_url;
    }

    const farmerData = {
      _id: new ObjectId().toString(),
      name,
      email,
      profilePic: profilePicUrl || 'https://us.123rf.com/450wm/glebdesign159/glebdesign1592409/glebdesign159240900440/235164018-cartoon-vector-illustration-of-farmer.jpg?ver=6'
    };

    const farmer = new Farmer(farmerData);
    await farmer.save();

    res.status(201).json({
      message: 'Farmer created successfully',
      farmerId: farmer._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.patch('/farmers/:id', upload.fields([
  { name: 'productImages', maxCount: 4 },
  { name: 'fssaiCert', maxCount: 1 },
  { name: 'organicCert', maxCount: 1 },
  { name: 'profilePic', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, address, description, deliveryCharge, products, showPhoneToUsers } = req.body;

    const farmer = await Farmer.findById(id);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    if (phone) farmer.phone = phone;
    if (address) farmer.address = JSON.parse(address);
    if (description) farmer.description = description;
    if (deliveryCharge) farmer.deliveryCharge = deliveryCharge;
    if (showPhoneToUsers !== undefined) farmer.showPhoneToUsers = showPhoneToUsers === 'true' || showPhoneToUsers === true;

    if (req.files['profilePic']) {
      const profilePicFile = req.files['profilePic'][0];
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'farmers/profile_pics', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(profilePicFile.buffer);
      });
      farmer.profilePic = result.secure_url;
      console.log('Updated Profile Pic URL:', result.secure_url);
    }

    const productImages = [];
    if (req.files['productImages']) {
      for (const file of req.files['productImages']) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'farmers/products', resource_type: 'image' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });
        productImages.push(result.secure_url);
      }
    }

    if (req.files['fssaiCert']) {
      const fssaiFile = req.files['fssaiCert'][0];
      const fssaiResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'farmers/certificates', resource_type: 'raw', public_id: `${Date.now()}-${fssaiFile.originalname}` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(fssaiFile.buffer);
      });
      farmer.certificates.fssai = fssaiResult.secure_url;
    }

    if (req.files['organicCert']) {
      const organicFile = req.files['organicCert'][0];
      const organicResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'farmers/certificates', resource_type: 'raw', public_id: `${Date.now()}-${organicFile.originalname}` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(organicFile.buffer);
      });
      farmer.certificates.organicFarm = organicResult.secure_url;
    }

    if (products) {
      const parsedProducts = JSON.parse(products);
      const newProducts = parsedProducts.map(product => ({
        id: new ObjectId().toString(),
        name: product.name,
        mrpPerKg: product.mrpPerKg,
        images: productImages.length ? productImages : [],
        description: product.description || '',
        category: product.category,
        subcategory: product.subcategory,
        stockInKg: product.stockInKg,
      }));
      farmer.products.push(...newProducts);
    }

    await farmer.save();

    res.status(200).json({
      message: 'Farmer updated successfully',
      farmer: farmer.toObject()
    });
  } catch (error) {
    console.error('Error updating farmer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/farmers/products', async (req, res) => {
  try {
    const farmers = await Farmer.find({}, 'products');
    const allProducts = farmers.flatMap(farmer => farmer.products);

    res.status(200).json({
      message: 'All products retrieved successfully',
      products: allProducts
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/farmers/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const farmer = await Farmer.findOne(
      { "products.id": productId },
      {
        "products.$": 1,
        name: 1,
        email: 1,
        profilePic: 1,
        isVerified: 1,
        "certificates.fssai": 1,
        "certificates.organicFarm": 1
      }
    );

    if (!farmer || !farmer.products.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = farmer.products[0];
    res.status(200).json({
      message: 'Product retrieved successfully',
      product: {
        ...product._doc,
        farmer: {
          email: farmer.email,
          name: farmer.name,
          profilePic: farmer.profilePic,
          isVerified: farmer.isVerified,
          certificates: {
            fssai: farmer.certificates.fssai || '',
            organicFarm: farmer.certificates.organicFarm || ''
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/farmers/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const farmer = await Farmer.findOne({ email });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    res.status(200).json({
      message: 'Farmer retrieved successfully',
      farmer
    });
  } catch (error) {
    console.error('Error fetching farmer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, email, phone, address, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const userData = {
      _id: new ObjectId().toString(),
      name,
      email,
      phone: phone || '',
      address: address || { street: '', city: '', state: '', zipCode: '' },
      role: role || 'customer'
    };

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      userId: user._id
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, cart, orders, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = JSON.parse(address);
    if (role) user.role = role;

    if (cart) {
      const parsedCart = JSON.parse(cart);
      user.cart.push(...parsedCart);
    }

    if (orders) {
      const newOrders = orders.map(order => ({
        id: new ObjectId().toString(),
        farmerId: order.farmerId,
        products: order.products.map(product => ({
          productId: product.productId,
          name: product.name,
          quantityInKg: product.quantityInKg,
          pricePerKg: product.pricePerKg,
          totalPrice: product.totalPrice
        })),
        totalAmount: order.totalAmount,
        status: order.status || 'pending'
      }));
      user.orders.push(...newOrders);
    }

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: user.toObject()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/users/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      user: user.toObject()
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/users/:id/cart/:productId', async (req, res) => {
  try {
    const { id, productId } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cartIndex = user.cart.findIndex(item => item.productId === productId);
    if (cartIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    user.cart.splice(cartIndex, 1);
    await user.save();

    res.status(200).json({
      message: 'Cart item removed successfully',
      user: user.toObject()
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const users = await User.find({}, { orders: 1, name: 1, phone: 1, address: 1, _id: 0, email: 1 });

    const allOrders = users.reduce((acc, user) => {
      const userOrders = user.orders.map(order => ({
        ...order.toObject(),
        userName: user.name,
        userPhone: user.phone || 'Not provided',
        userEmail: user.email,
        userAddress: `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}`.trim().replace(/\s*,\s*/g, ', ') || 'Not provided'
      }));
      return acc.concat(userOrders);
    }, []);

    res.status(200).json({
      message: 'All orders retrieved successfully',
      orders: allOrders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
  
    socket.on('joinChat', ({ userEmail, farmerEmail }, callback) => {
      const normalizedUserEmail = userEmail.toLowerCase();
      const normalizedFarmerEmail = farmerEmail.toLowerCase();
      const room = `${normalizedUserEmail}_${normalizedFarmerEmail}`;
      socket.join(room);
      console.log(`Joined room: ${room}`);
      if (callback) callback({ status: 'Joined room successfully' });
    });
  
    socket.on('sendMessage', async (message, callback) => {
      try {
        const { senderType, senderEmail, receiverType, receiverEmail, content } = message;
        console.log('Received message:', message);
  
        if (!senderType || !senderEmail || !receiverType || !receiverEmail || !content) {
          throw new Error('Invalid message data: Missing required fields');
        }
  
        const userEmail = senderType === 'customer' ? senderEmail : receiverEmail;
        const farmerEmail = senderType === 'farmer' ? senderEmail : receiverEmail;
  
        const newMessage = {
          sender: {
            type: senderType,
            email: senderEmail,
          },
          receiverEmail, // Add receiverEmail for client-side room computation
          content,
          createdAt: new Date(),
          isRead: false,
        };
  
        console.log('Updating chat for:', { userEmail, farmerEmail });
        let chat = await Chat.findOneAndUpdate(
          {
            'participants.userEmail': { $regex: new RegExp(`^${userEmail}$`, 'i') },
            'participants.farmerEmail': { $regex: new RegExp(`^${farmerEmail}$`, 'i') },
          },
          {
            $push: { messages: newMessage },
            $set: { lastMessageAt: new Date() },
          },
          {
            new: true,
            upsert: true,
          }
        );
  
        console.log('Chat updated:', chat);
  
        const normalizedUserEmail = userEmail.toLowerCase();
        const normalizedFarmerEmail = farmerEmail.toLowerCase();
        const room = `${normalizedUserEmail}_${normalizedFarmerEmail}`;
        console.log('Emitting message to room:', room);
        console.log('Message being emitted:', newMessage);
        io.to(room).emit('receiveMessage', newMessage);
  
        if (callback) callback({ status: 'Message sent successfully' });
      } catch (error) {
        console.error('Error saving message:', error.message, error.stack);
        if (callback) callback({ error: 'Failed to send message', details: error.message });
      }
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
  
  // Routes
  app.get('/chat/conversations/customer/:userEmail', async (req, res) => {
    try {
      const chats = await Chat.find({ 'participants.userEmail': req.params.userEmail })
        .sort({ lastMessageAt: -1 });
      const chatData = await Promise.all(chats.map(async (chat) => {
        const farmer = await Farmer.findOne({ email: chat.participants.farmerEmail }, 'name');
        return {
          userEmail: chat.participants.userEmail,
          farmerEmail: chat.participants.farmerEmail,
          farmerName: farmer ? farmer.name : 'Unknown Farmer',
          lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null,
          lastMessageAt: chat.lastMessageAt,
        };
      }));
      res.json(chatData);
    } catch (error) {
      console.error('Error fetching customer conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });
  
  app.get('/chat/conversations/farmer/:farmerEmail', async (req, res) => {
    try {
      const farmerEmail = req.params.farmerEmail;
      console.log('Fetching chats for farmer:', farmerEmail);
      const chats = await Chat.find({
        'participants.farmerEmail': { $regex: new RegExp(`^${farmerEmail}$`, 'i') },
      }).sort({ lastMessageAt: -1 });
  
      console.log('Found chats:', chats);
  
      const chatData = await Promise.all(chats.map(async (chat) => {
        const user = await User.findOne({ email: chat.participants.userEmail }, 'name');
        return {
          userEmail: chat.participants.userEmail,
          farmerEmail: chat.participants.farmerEmail,
          userName: user ? user.name : chat.participants.userEmail,
          lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null,
          lastMessageAt: chat.lastMessageAt,
        };
      }));
  
      res.json(chatData);
    } catch (error) {
      console.error('Error fetching farmer conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });
  
  app.get('/chat/history', async (req, res) => {
    const { userEmail, farmerEmail } = req.query;
    try {
      const chat = await Chat.findOne({
        'participants.userEmail': userEmail,
        'participants.farmerEmail': farmerEmail,
      });
      if (!chat) {
        return res.json([]);
      }
      res.json(chat.messages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ error: 'Failed to fetch chat history' });
    }
  });
  
  app.get('/api/farmer/:email', async (req, res) => {
    const { email } = req.params;
    try {
      const farmer = await Farmer.findOne({ email }, 'name email');
      if (!farmer) {
        return res.status(404).json({ error: 'Farmer not found' });
      }
      res.json({ email: farmer.email, name: farmer.name });
    } catch (error) {
      console.error('Error fetching farmer:', error);
      res.status(500).json({ error: 'Failed to fetch farmer' });
    }
  });
  
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});