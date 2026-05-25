import express from 'express';
import User from '../models/User.js';
import Unit from '../models/Unit.js';
const router = express.Router();

// --- 1. ADMIN & ANALYTICS ROUTES ---

router.get('/deep-analysis', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' });
        const units = await Unit.find();
        
        // Prepare Scatter & Line Chart Data
        const scatterData = users.map(u => ({
            name: u.email ? u.email.split('@')[0] : 'User',
            time: Number(u.totalTimeSpent) || 0,
            completed: u.completedResources?.length || 0,
        }));

        // Batch Segmentation Logic
        const segments = [
            { name: 'Power Users', value: users.filter(u => (u.completedResources?.length || 0) >= 8).length },
            { name: 'Active', value: users.filter(u => (u.completedResources?.length || 0) >= 3 && (u.completedResources?.length || 0) < 8).length },
            { name: 'Beginners', value: users.filter(u => (u.completedResources?.length || 0) < 3).length },
        ].filter(s => s.value > 0);

        // Resource Distribution Logic (Matches Frontend expectation)
        const typeCount = { PDF: 0, VIDEO: 0, FORMS: 0 };
        units.forEach(unit => {
            unit.resources.forEach(r => { 
                if(r.type === 'pdf') typeCount.PDF++;
                else if(r.type === 'video') typeCount.VIDEO++;
                else if(r.type === 'googleForm') typeCount.FORMS++; // Explicitly check for googleForm
            });
        });

        res.json({ 
            scatterData, 
            segments: segments.length > 0 ? segments : [{name: 'No Data', value: 1}], 
            resourceDist: [
                { type: 'PDF', count: typeCount.PDF },
                { type: 'VIDEO', count: typeCount.VIDEO },
                { type: 'FORMS', count: typeCount.FORMS }
            ], 
            totalUsers: users.length 
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/all-users', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.json(users);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find({ role: 'user' })
            .sort({ totalTimeSpent: -1 })
            .limit(5);
        res.json(topUsers.map(u => ({
            email: u.email.split('@')[0],
            time: u.totalTimeSpent || 0
        })));
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/user-stats', async (req, res) => {
    try {
        const { email } = req.query;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({
            totalTime: user.totalTimeSpent || 0,
            completedTasks: user.completedResources?.length || 0
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Exists" });
        user = new User({ email, password, role: 'user' }); 
        await user.save();
        res.status(201).json({ message: "Success", user });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(401).json({ message: "Invalid" });
        res.status(200).json({ message: "Success", user });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/update-progress', async (req, res) => {
    try {
        const { email, resourceUrl } = req.body;
        await User.findOneAndUpdate({ email }, { $addToSet: { completedResources: resourceUrl } });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/update-time', async (req, res) => {
    try {
        const { email, minutes } = req.body;
        await User.findOneAndUpdate({ email }, { $inc: { totalTimeSpent: minutes } });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;