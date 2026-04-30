const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    experience: { type: String, required: true },
    photo: { type: String, default: 'default-photo.jpg' }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Doctor', doctorSchema);