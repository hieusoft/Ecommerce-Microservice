const express = require('express');
const router = express.Router();

const FlowerController = require('../Controllers/FlowerController');
const flowerController = new FlowerController();

router.post('/', flowerController.createFlower);
router.get('/:id', flowerController.getFlowerById);
router.get('/', flowerController.getAllFlowers);
router.put('/:id', flowerController.updateFlower);
router.delete('/:id', flowerController.deleteFlower);

module.exports = router; 