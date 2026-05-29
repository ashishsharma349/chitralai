const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Database schema model representing a Candidate profile
const Candidate = sequelize.define('Candidate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'candidates',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['email'],
    },
  ],
});

module.exports = Candidate;
