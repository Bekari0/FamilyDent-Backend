const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    doctorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Doctor', 
        required: true 
    },
    date: { type: Date, required: true },
    status: { type: String, default: 'Ожидается' } 
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);