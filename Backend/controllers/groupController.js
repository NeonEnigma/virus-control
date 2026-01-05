const Group = require('../models/Group');

exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.findAll();
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const group = await Group.create({ name });
        res.json(group);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
