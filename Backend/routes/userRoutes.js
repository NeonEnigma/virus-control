const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, userController.getUsers);
router.get('/me', auth, userController.getMe);
router.put('/:id', auth, userController.updateUser);

module.exports = router;
