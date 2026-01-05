const Sequelize = require('sequelize');
const db = require('../config/database');

const Group = db.define('group', {
    id: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    completedAt: {
        type: Sequelize.DATE
    },
    completionDurationSec: {
        type: Sequelize.INTEGER
    }
});

module.exports = Group;
