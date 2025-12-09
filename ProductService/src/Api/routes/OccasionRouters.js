const express = require('express');
const OccasionController = require('../Controllers/OccasionController');

module.exports = (rabbitService, redisService) => {
    const router = express.Router();
    const occasionController = new OccasionController(rabbitService, redisService);

    router.post('/', (req, res) => occasionController.createOccasion(req, res));
    router.get('/:id', (req, res) => occasionController.getOccasionById(req, res));
    router.get('/', (req, res) => occasionController.getAllOccasions(req, res));
    router.put('/:id', (req, res) => occasionController.updateOccasion(req, res));
    router.delete('/:id', (req, res) => occasionController.deleteOccasion(req, res));

    return router;
};