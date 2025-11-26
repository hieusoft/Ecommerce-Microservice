const express = require('express');
const BouquetController = require('../Controllers/BouquetController');


module.exports = (rabbitService) => {
    const router = express.Router();

    const bouquetController = new BouquetController(rabbitService);

    router.get('/results', (req, res) => bouquetController.searchBouquets(req, res));
    router.post('/', (req, res) => bouquetController.createBouquet(req, res));
    router.get('/:id', (req, res) => bouquetController.getBouquetById(req, res));
    router.get('/', (req, res) => bouquetController.getAllBouquets(req, res));
    router.put('/:id', (req, res) => bouquetController.updateBouquet(req, res));
    router.delete('/:id', (req, res) => bouquetController.deleteBouquet(req, res));

    return router;
};