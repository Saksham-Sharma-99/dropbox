const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/dbConfig');
const { User } = require('./user');
const { Document } = require('./document');

const AccessList = sequelize.define('AccessList', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'documents',
            key: 'id',
        },
    },
    accessType: {
        type: DataTypes.ENUM('edit', 'read', 'owner'),
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
    tableName: 'accessLists',
});

belongsToUser = AccessList.belongsTo(User, { foreignKey: 'userId' });
belongsToDocument = AccessList.belongsTo(Document, { foreignKey: 'documentId' });
User.hasMany(AccessList, { foreignKey: 'userId' });

(async () => {
    await sequelize.sync();
})();

module.exports = {
    AccessList,
};
