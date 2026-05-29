const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Resume = require('./resume.model');
const JobDescription = require('./job.model');

// Database schema model representing AI screening results of a candidate's resume
const ScreeningResult = sequelize.define('ScreeningResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  resumeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'resume_id',
    references: {
      model: Resume,
      key: 'id',
    },
  },
  jobDescriptionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'job_description_id',
    references: {
      model: JobDescription,
      key: 'id',
    },
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  skillsMatch: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'skills_match',
  },
  skillsMissing: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'skills_missing',
  },
  experienceRelevance: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'experience_relevance',
  },
  educationAlignment: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'education_alignment',
  },
  rationale: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'screening_results',
  timestamps: true,
  underscored: true,
});

Resume.hasMany(ScreeningResult, { foreignKey: 'resumeId', onDelete: 'CASCADE' });
ScreeningResult.belongsTo(Resume, { foreignKey: 'resumeId' });

JobDescription.hasMany(ScreeningResult, { foreignKey: 'jobDescriptionId', onDelete: 'CASCADE' });
ScreeningResult.belongsTo(JobDescription, { foreignKey: 'jobDescriptionId' });

module.exports = ScreeningResult;
