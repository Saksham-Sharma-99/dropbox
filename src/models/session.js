const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/dbConfig');
const { User } = require('./user');

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
    },
    accessToken: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'sessions',
});

belongsToUser = Session.belongsTo(User, { foreignKey: 'userId' });

(async () => {
    await sequelize.sync();
})();

module.exports = {
    Session,
};
