import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    // Naya data for tracking
    completedResources: [{ type: String }], // Array of resource URLs/IDs
    totalTimeSpent: { type: Number, default: 0 }, // In minutes
    lastActive: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User;