const express = require('express');
const GreetingController = require('../Controllers/GreetingController');

module.exports = (rabbitService,redisService) => {
    const router = express.Router();
    const greetingController = new GreetingController(rabbitService,redisService);

    router.post('/', (req, res) => greetingController.createGreeting(req, res));
    router.get('/:id', (req, res) => greetingController.getGreetingById(req, res));
    router.get('/', (req, res) => greetingController.getAllGreetings(req, res));
    router.put('/:id', (req, res) => greetingController.updateGreeting(req, res));
    router.delete('/:id', (req, res) => greetingController.deleteGreeting(req, res));

    return router;
};