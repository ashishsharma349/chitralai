const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Candidate = require('./candidate.model');

// Database schema model representing a Candidate resume
const Resume = sequelize.define('Resume', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  candidateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'candidate_id',
    references: {
      model: Candidate,
      key: 'id',
    },
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_name',
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_type',
  },
  extractedText: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    field: 'extracted_text',
  },
}, {
  tableName: 'resumes',
  timestamps: true,
  underscored: true,
});

Candidate.hasMany(Resume, { foreignKey: 'candidateId', onDelete: 'CASCADE' });
Resume.belongsTo(Candidate, { foreignKey: 'candidateId' });

module.exports = Resume;
