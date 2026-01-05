const User = require('../models/User');
const Group = require('../models/Group');

// Get all users (Admin only usually, but simplified here)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: Group
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: Group
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user (e.g. assign group)
exports.updateUser = async (req, res) => {
    try {
        const { groupId, role, assignedUserUid, timerEndTime, timerInitialDuration, timerPausedRemaining, timerStatus, lastGame, solvedStats } = req.body;
        const updateFields = {};
        if (groupId !== undefined) updateFields.groupId = groupId;
        if (role !== undefined) updateFields.role = role;
        if (assignedUserUid !== undefined) updateFields.assignedUserUid = assignedUserUid;
        if (timerEndTime !== undefined) updateFields.timerEndTime = timerEndTime;
        if (timerInitialDuration !== undefined) updateFields.timerInitialDuration = timerInitialDuration;
        if (timerPausedRemaining !== undefined) updateFields.timerPausedRemaining = timerPausedRemaining;
        if (timerStatus !== undefined) updateFields.timerStatus = timerStatus;
        if (lastGame !== undefined) updateFields.lastGame = lastGame;
        if (solvedStats !== undefined) updateFields.solvedStats = solvedStats;

        await User.update(updateFields, { where: { id: req.params.id } });
        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
