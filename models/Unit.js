import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
    unitNumber: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    resources: [
        {
            type: { type: String, enum: ['pdf', 'video', 'audio', 'googleForm'], default: 'pdf' },
            title: { type: String },
            url: { type: String }
        }
    ]
}, { timestamps: true });

const Unit = mongoose.model('Unit', unitSchema);
export default Unit;