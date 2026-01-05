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
        const { groupId, role, assignedUserUid } = req.body;
        const updateFields = {};
        if (groupId !== undefined) updateFields.groupId = groupId;
        if (role !== undefined) updateFields.role = role;
        if (assignedUserUid !== undefined) updateFields.assignedUserUid = assignedUserUid;

        await User.update(updateFields, { where: { id: req.params.id } });
        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
