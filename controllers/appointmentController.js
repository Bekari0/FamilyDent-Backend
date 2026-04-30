const Appointment = require('../models/Appointment'); // Подключаем модель

const createAppointment = async (req, res) => {
    try {
        const { patientName, doctorId, date } = req.body;
        if (!patientName || !doctorId || !date) {
            return res.status(400).json({ message: 'Заполните все поля' });
        }
        const newAppointment = new Appointment({
            patientName: patientName.trim(),
            doctorId,
            date
        });

        const savedAppointment = await newAppointment.save();
        
        res.status(201).json({ 
            message: 'Вы успешно записаны на прием!', 
            data: savedAppointment 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при создании записи' });
    }
};

module.exports = { createAppointment };