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

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', 
    process.env.CLIENT_URL,
    'https://*.netlify.app'
].filter(Boolean);

const corsOptions = {
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.some(allowed => {
            if (allowed.includes('*')) {
                const pattern = allowed.replace('*', '.*');
                return new RegExp(pattern).test(origin);
            }
            return allowed === origin;
        })) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); 

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: { message: 'Слишком много запросов с вашего IP, пожалуйста, попробуйте позже.' }
});

app.use('/api/', apiLimiter);

app.get('/', (req, res) => {
    res.json({ 
        message: 'Добро пожаловать на API FamilyDent! Сервер работает и защищен',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 });
});

app.use('/api/doctors', doctorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use('*', (req, res) => {
    res.status(404).json({ message: 'Маршрут не найден' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Режим: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS разрешен для: ${allowedOrigins.join(', ')}`);
});