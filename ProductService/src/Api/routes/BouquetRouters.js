const express = require('express');
const router = express.Router();

const BouquetController = require('../Controllers/BouquetController');
const bouquetController = new BouquetController();

router.get('/results', bouquetController.searchBouquets);
router.post('/', bouquetController.createBouquet);
router.get('/:id', bouquetController.getBouquetById);
router.get('/', bouquetController.getAllBouquets);
router.put('/:id', bouquetController.updateBouquet);
router.delete('/:id', bouquetController.deleteBouquet);


module.exports = router; 