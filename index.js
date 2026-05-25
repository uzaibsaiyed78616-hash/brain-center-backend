import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import unitRoutes from './routes/unitRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. CORS Setup (Sabse pehle)
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));

// 2. Body Parser
app.use(express.json());

// 3. Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Request Logger (Debugging ke liye - Terminal mein dikhega)
app.use((req, res, next) => {
    console.log(`${req.method} request aayi hai: ${req.url}`);
    next();
});

// 5. Routes Registration
app.use('/api/units', unitRoutes);
app.use('/api/auth', authRoutes);

// 6. Database Connection
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edu-project';
mongoose.connect(dbURI)
    .then(() => console.log('MongoDB Connected!'))
    .catch(err => console.log('DB Error:', err.message));

// 7. Global 404 Handler (Agar route na mile)
app.use((req, res) => {
    res.status(404).json({ message: `Bhai ye wala route (${req.originalUrl}) backend mein nahi hai!` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on: http://localhost:${PORT}`));