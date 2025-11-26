const express = require('express');
const router = express.Router();

const GreetingController = require('../Controllers/GreetingController');
const greetingController = new GreetingController();

router.post('/', greetingController.createGreeting);
router.get('/:id', greetingController.getGreetingById);
router.get('/', greetingController.getAllGreetings);
router.put('/:id', greetingController.updateGreeting);
router.delete('/:id', greetingController.deleteGreeting);
module.exports = router;