const User = require('../models/User');
const Group = require('../models/Group');

exports.startGame = async (req, res) => {
    try {
        console.log('>>> DEBUG: startGame called', req.body);
        const { userId, minutes } = req.body;
        console.log(`>>> DEBUG: userId=${userId}, minutes=${minutes}, type=${typeof minutes}`);

        if (!userId || !minutes) return res.status(400).json({ message: 'Missing parameters' });

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const durationSec = parseInt(minutes) * 60;
        console.log('>>> DEBUG: durationSec:', durationSec);

        if (Number.isNaN(durationSec)) {
            console.error('>>> DEBUG: durationSec is NaN!');
            return res.status(400).json({ message: 'Invalid minutes' });
        }

        const endTime = new Date(Date.now() + durationSec * 1000);
        console.log('>>> DEBUG: Calculated endTime:', endTime);

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
exports.updatePuzzles = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const currentPuzzles = user.puzzles || {};
        const updates = req.body;

        // Merge updates
        const newPuzzles = { ...currentPuzzles, ...updates };

        user.puzzles = newPuzzles;
        await user.save();

        res.json({ message: 'Puzzles updated', puzzles: newPuzzles });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.finishGame = async (req, res) => {
    try {
        // The user ID should come from the authenticated user usually, 
        // but if an admin finishes it for someone else, we might need userId in body.
        // For now assume user finishes their own game or admin sends userId.
        const userId = req.body.userId || req.user.id;
        const { result, playerName } = req.body; // result: 'win' or 'lose'

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const now = new Date();
        let remainingSeconds = 0;

        // Calculate remaining seconds
        if (user.timerEndTime) {
            remainingSeconds = Math.max(0, (user.timerEndTime - now) / 1000);
        } else if (user.timerPausedRemaining !== null) {
            remainingSeconds = user.timerPausedRemaining;
        }

        const totalSeconds = user.timerInitialDuration;

        // Update Puzzles (if win)
        let newPuzzles = user.puzzles || {};
        if (result === 'win') {
            newPuzzles = { ...newPuzzles, virusDeactivated: true };
        }

        // Update Solved Stats (if win)
        let newSolvedStats = user.solvedStats || {};
        if (result === 'win') {
            newSolvedStats = {
                finishedAt: now,
                remainingSeconds,
                totalSeconds,
                updatedAt: now
            };
        }

        // Update Last Game
        const lastGame = {
            finishedAt: now,
            result,
            remainingSeconds,
            totalSeconds,
            playerName: playerName || user.email,
            playerUid: user.id
        };

        // Pause Timer
        const timerStatus = result === 'win' ? 'win-paused' : 'lose-paused';

        // Perform updates on User
        await user.update({
            puzzles: newPuzzles,
            solvedStats: newSolvedStats,
            lastGame: lastGame,
            timerStatus: timerStatus,
            timerEndTime: null,
            timerPausedRemaining: remainingSeconds
        });

        // Update Group if exists
        if (user.groupId && result === 'win') {
            const group = await Group.findByPk(user.groupId);
            if (group && !group.completedAt) {
                const completionDurationSec = (totalSeconds && remainingSeconds) ? Math.max(0, totalSeconds - remainingSeconds) : null;
                await group.update({
                    completedAt: now,
                    completionDurationSec,
                    completedBy: user.id
                });
            }
        }

        res.json({ message: 'Game finished', result, remainingSeconds });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
