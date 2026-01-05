const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, groupController.getGroups);
router.post('/', auth, groupController.createGroup);

module.exports = router;
