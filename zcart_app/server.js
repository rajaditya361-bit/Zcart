const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection URL
const MONGO_URI = 'mongodb+srv://rajaditya361_db_user:6200002592vk@cluster0.gkrcltr.mongodb.net/zcart?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schemas & Models
const productSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: String,
    category: String,
    price: Number,
    origPrice: Number,
    badge: String,
    image: String,
    desc: String,
    images: [String]
});

const orderSchema = new mongoose.Schema({
    id: Number,
    amount: Number,
    customer: {
        name: String,
        phone: String,
        address: String
    },
    items: String,
    date: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        let products = await Product.find({});
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new product
app.post('/api/products', async (req, res) => {
    try {
        let newProd = new Product(req.body);
        await newProd.save();
        res.json({ success: true, product: newProd });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update product (Supports category name editing)
app.put('/api/products/:id', async (req, res) => {
    try {
        let prodId = Number(req.params.id);
        let updatedProd = await Product.findOneAndUpdate({ id: prodId }, req.body, { new: true });
        if (updatedProd) {
            res.json({ success: true, product: updatedProd });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        let orders = await Order.find({});
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Place new order
app.post('/api/orders', async (req, res) => {
    try {
        let newOrder = new Order({ id: Date.now(), ...req.body });
        await newOrder.save();
        res.json({ success: true, order: newOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`ZCart server running on port ${PORT}`);
});
