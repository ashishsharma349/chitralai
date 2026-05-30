const JobDescription = require('../models/job.model');
const ScreeningResult = require('../models/screening.model');

// Creates a new job description in the database
async function create(data) {
  return await JobDescription.create(data);
}

// Retrieves a specific job description by its database identifier
async function findById(id) {
  return await JobDescription.findByPk(id);
}

const { sequelize } = require('../config/db');

// Retrieves all job descriptions stored in the database with candidate counts
async function findAll() {
  return await JobDescription.findAll({
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM screening_results AS sr
            WHERE sr.job_description_id = JobDescription.id
          )`),
          'candidateCount'
        ]
      ]
    },
    order: [['created_at', 'DESC']],
  });
}

// Counts the total number of job descriptions
async function count() {
  return await JobDescription.count();
}

// Deletes a job description by its id within the given transaction
async function deleteById(id, transaction) {
  return await JobDescription.destroy({ where: { id }, transaction });
}

// Deletes all screening results associated with the given job id within the given transaction
async function deleteScreeningResultsByJobId(jobId, transaction) {
  return await ScreeningResult.destroy({ where: { jobDescriptionId: jobId }, transaction });
}

module.exports = {
  create,
  findById,
  findAll,
  count,
  deleteById,
  deleteScreeningResultsByJobId,
};
