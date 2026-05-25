import express from 'express';
import multer from 'multer';
import path from 'path';
import Unit from '../models/Unit.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const cleanName = file.originalname.replace(ext, "").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 20);
        cb(null, `${Date.now()}-${cleanName}${ext}`);
    }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "File select karo!" });
        res.status(200).json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
    } catch (error) { res.status(500).json({ message: "Upload failed" }); }
});

// GET: Sabhi units dashboard ke liye
router.get('/', async (req, res) => {
    try {
        const units = await Unit.find().sort({ unitNumber: 1 });
        res.status(200).json(units);
    } catch (error) {
        res.status(500).json({ message: "Error fetching units" });
    }
});

// POST: Unit add ya update karne ke liye
router.post('/add', async (req, res) => {
    try {
        const { unitNumber, title, resources } = req.body;
        // Upsert true matlab agar unitNumber hai toh update, nahi toh naya create
        const unit = await Unit.findOneAndUpdate(
            { unitNumber }, 
            { title, resources }, 
            { new: true, upsert: true }
        );
        res.status(201).json(unit);
    } catch (error) {
        res.status(500).json({ message: "Error saving unit" });
    }
});

router.delete('/:id', async (req, res) => {
    await Unit.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

export default router;