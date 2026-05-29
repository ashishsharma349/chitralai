const JobDescription = require('../models/job.model');

// Creates a new job description in the database
async function create(data) {
  return await JobDescription.create(data);
}

// Retrieves a specific job description by its database identifier
async function findById(id) {
  return await JobDescription.findByPk(id);
}

// Retrieves all job descriptions stored in the database
async function findAll() {
  return await JobDescription.findAll({
    order: [['created_at', 'DESC']],
  });
}

module.exports = {
  create,
  findById,
  findAll,
};
