const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const auth = require('../middleware/authMiddleware');

router.post('/start', auth, gameController.startGame);
router.post('/pause', auth, gameController.pauseGame);
router.post('/resume', auth, gameController.resumeGame);
router.post('/add-time', auth, gameController.addTime);
router.put('/puzzles', auth, gameController.updatePuzzles);
router.post('/finish', auth, gameController.finishGame);
module.exports = router;
