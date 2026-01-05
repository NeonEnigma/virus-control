const Sequelize = require('sequelize');
const db = require('../config/database');
const Group = require('./Group');

const User = db.define('user', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4, // Or keep string if migrating Firebase UIDs directly
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    role: {
        type: Sequelize.ENUM('super-admin', 'restricted-admin', 'user'),
        defaultValue: 'user'
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    groupId: {
        type: Sequelize.UUID,
        references: {
            model: Group,
            key: 'id'
        }
    },
    assignedUserUid: {
        type: Sequelize.UUID,
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
