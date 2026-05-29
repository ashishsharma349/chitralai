const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Database schema model representing a Job Description
const JobDescription = sequelize.define('JobDescription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
}, {
  tableName: 'job_descriptions',
  timestamps: true,
  underscored: true,
});

module.exports = JobDescription;
