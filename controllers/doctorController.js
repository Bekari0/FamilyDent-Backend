const Doctor = require('../models/Doctor'); 

const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера при получении врачей' });
    }
};

const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Врач не найден' });
        }
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Неверный ID врача или ошибка сервера' });
    }
};

module.exports = { getDoctors, getDoctorById };