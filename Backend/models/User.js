const Sequelize = require('sequelize');
const db = require('../config/database');
const Group = require('./Group');

const User = db.define('user', {
    id: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4, // Keeps generating UUIDs for new ones, but allows strings
        primaryKey: true
    },
    // ...
    groupId: {
        type: Sequelize.STRING, // Changed from UUID to STRING for compatibility
        references: {
            model: Group,
            key: 'id'
        }
    },
    assignedUserUid: {
        type: Sequelize.STRING, // Changed from UUID to STRING for compatibility
        allowNull: true
    },
    // Timer fields
    timerEndTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
    timerInitialDuration: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    timerPausedRemaining: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
    timerStatus: {
        type: Sequelize.STRING,
        defaultValue: 'idle'
    },
    puzzles: {
        type: Sequelize.JSON,
        defaultValue: {}
    },
    lastGame: {
        type: Sequelize.JSON,
        defaultValue: {}
    },
    solvedStats: {
        type: Sequelize.JSON,
        defaultValue: {}
    }
});

// Associations
User.belongsTo(Group, { foreignKey: 'groupId' });
Group.hasMany(User, { foreignKey: 'groupId' });

module.exports = User;
