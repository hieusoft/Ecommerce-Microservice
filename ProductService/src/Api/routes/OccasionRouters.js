const express = require('express');
const router = express.Router();
const OccasionController = require('../Controllers/OccasionController');
const occasionController = new OccasionController();

router.post('/', occasionController.createOccasion);
router.get('/:id', occasionController.getOccasionById);
router.get('/', occasionController.getAllOccasions);
router.put('/:id', occasionController.updateOccasion);
router.delete('/:id', occasionController.deleteOccasion);
module.exports = router;