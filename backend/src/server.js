const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// --- 1. CONFIGURATION ---

// Allow Cross-Origin requests (so your frontend can talk to this)
app.use(cors());

// Parse JSON bodies (for POST requests)
app.use(express.json());

// --- 2. BIGINT SERIALIZATION PATCH ---
// Prisma returns BigInts for uint256, but JSON.stringify() crashes on them.
// This monkey-patch converts all BigInts to Strings automatically.
BigInt.prototype.toJSON = function () {
    return this.toString();
};

// --- 3. ROUTES ---

// Health Check
app.get('/', (req, res) => {
    res.send('FlightStakeFi API is Running ✈️');
});

// Import Routes
const marketRoutes = require('./api/market.routes');
const userRoutes = require('./api/user.routes');
const authRoutes = require('./api/auth.routes');

// Mount Routes
app.use('/api/market', marketRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

// --- 4. START SERVER ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
