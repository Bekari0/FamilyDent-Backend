const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); 
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit'); 
require('dotenv').config();

const doctorRoutes = require('./routes/doctorRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const connectDB = require('./config/db'); 

connectDB();

const app = express();
app.use(helmet());
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true 
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); 

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: { message: 'Слишком много запросов с вашего IP, пожалуйста, попробуйте позже.' }
});

app.use('/api/', apiLimiter);
app.get('/', (req, res) => {
    res.send('Добро пожаловать на API FamilyDent! Сервер работает и защищен');
});

app.use('/api/doctors', doctorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

