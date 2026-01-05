const User = require('../models/User');

exports.startGame = async (req, res) => {
    try {
        const { userId, minutes } = req.body;
        // Only admin or the user themselves (if allowed) can start it. 
        // Assuming admin control for now based on previous code context.

        if (!userId || !minutes) return res.status(400).json({ message: 'Missing parameters' });

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const durationSec = minutes * 60;
        const endTime = new Date(Date.now() + durationSec * 1000);

        await user.update({
            timerEndTime: endTime,
            timerInitialDuration: durationSec,
            timerStatus: 'active',
            timerPausedRemaining: null
        });

        res.json({ message: 'Game started', endTime });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.pauseGame = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.timerStatus !== 'active' || !user.timerEndTime) {
            return res.status(400).json({ message: 'Timer not active' });
        }

        const now = new Date();
        const remainingMs = user.timerEndTime - now;
        const remainingSec = Math.max(0, remainingMs / 1000);

        await user.update({
            timerStatus: 'paused',
            timerPausedRemaining: remainingSec,
            timerEndTime: null // Clear end time as it is not running
        });

        res.json({ message: 'Game paused', remainingSec });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.resumeGame = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.timerStatus !== 'paused' || user.timerPausedRemaining === null) {
            return res.status(400).json({ message: 'Timer not paused' });
        }

        const now = new Date();
        const newEndTime = new Date(now.getTime() + user.timerPausedRemaining * 1000);

        await user.update({
            timerStatus: 'active',
            timerEndTime: newEndTime,
            timerPausedRemaining: null
        });

        res.json({ message: 'Game resumed', newEndTime });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addTime = async (req, res) => {
    try {
        const { userId, minutes } = req.body; // minutes can be negative
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.timerStatus === 'active' && user.timerEndTime) {
            const newEndTime = new Date(user.timerEndTime.getTime() + minutes * 60000);
            await user.update({ timerEndTime: newEndTime });
            res.json({ message: 'Time updated', newEndTime });
        } else if (user.timerStatus === 'paused' && user.timerPausedRemaining !== null) {
            const newRemaining = user.timerPausedRemaining + (minutes * 60);
            await user.update({ timerPausedRemaining: Math.max(0, newRemaining) });
            res.json({ message: 'Time updated (paused)', newRemaining });
        } else {
            res.status(400).json({ message: 'Timer not active or paused' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
