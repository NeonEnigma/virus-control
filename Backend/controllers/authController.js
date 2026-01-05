const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { email, password, role, groupId } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            role: role || 'user',
            groupId: groupId || null
        });

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate Token
        const payload = {
            user: {
                id: user.id,
                role: user.role,
                isAdmin: user.isAdmin
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
