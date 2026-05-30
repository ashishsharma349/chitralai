const ScreeningResult = require('../models/screening.model');
const Resume = require('../models/resume.model');
const Candidate = require('../models/candidate.model');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// Saves a candidate's screening results in the database
async function createResult(data, transaction) {
  return ScreeningResult.create(data, { transaction });
}

// Retrieves evaluation results for a specific job ID, supporting search, sorting, and pagination
async function findByJobId(jobId, options = {}) {
  const { search = '', limit = 50, offset = 0 } = options;
  const whereClause = {
    jobDescriptionId: jobId
  };

  const includeClause = [
    {
      model: Resume,
      required: true,
      include: [
        {
          model: Candidate,
          required: true,
          where: search.trim() ? {
            [Op.or]: [
              sequelize.where(sequelize.fn('LOWER', sequelize.col('Resume->Candidate.name')), 'LIKE', `%${search.toLowerCase()}%`),
              sequelize.where(sequelize.fn('LOWER', sequelize.col('Resume->Candidate.email')), 'LIKE', `%${search.toLowerCase()}%`)
            ]
          } : undefined
        }
      ]
    }
  ];

  return ScreeningResult.findAndCountAll({
    where: whereClause,
    include: includeClause,
    order: [['score', 'DESC']],
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10)
  });
}

module.exports = {
  createResult,
  findByJobId
};
