const Service = require('../models/Service');

const getServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера при получении услуг' });
    }
};

const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Услуга не найдена' });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Неверный ID услуги или ошибка сервера' });
    }
};

module.exports = { getServices, getServiceById };