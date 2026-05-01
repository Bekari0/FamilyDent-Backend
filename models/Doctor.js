const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    experience: { type: String, default: '' },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    education: { type: String, default: '' },
    achievements: { type: [String], default: [] }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Doctor', doctorSchema);