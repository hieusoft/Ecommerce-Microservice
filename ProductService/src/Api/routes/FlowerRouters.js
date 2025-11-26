const express = require('express');
const FlowerController = require('../Controllers/FlowerController');

module.exports = (rabbitService) => {
    const router = express.Router();
    const flowerController = new FlowerController(rabbitService);

    router.post('/', (req, res) => flowerController.createFlower(req, res));
    router.get('/:id', (req, res) => flowerController.getFlowerById(req, res));
    router.get('/', (req, res) => flowerController.getAllFlowers(req, res));
    router.put('/:id', (req, res) => flowerController.updateFlower(req, res));
    router.delete('/:id', (req, res) => flowerController.deleteFlower(req, res));

    return router;
};