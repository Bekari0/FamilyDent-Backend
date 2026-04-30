const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    category: { type: String, required: true },
    services: [{ type: String }] 
}, {
    timestamps: true
});


module.exports = mongoose.model('Service', serviceSchema, 'services');