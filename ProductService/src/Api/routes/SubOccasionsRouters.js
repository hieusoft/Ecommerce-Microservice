const express = require('express');
const SubOccasionController = require('../Controllers/SubOccasionController');

module.exports = (rabbitService,redisService) => {
    const router = express.Router();
    const subOccasionController = new SubOccasionController(rabbitService,redisService);
    router.post('/', (req, res) => subOccasionController.createSubOccasion(req, res));
    router.get('/:id', (req, res) => subOccasionController.getSubOccasionById(req, res));
    router.get('/', (req, res) => subOccasionController.getAllSubOccasions(req, res));
    router.put('/:id', (req, res) => subOccasionController.updateSubOccasion(req, res));
    router.delete('/:id', (req, res) => subOccasionController.deleteSubOccasion(req, res));
    return router;
};