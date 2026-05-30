const jobService = require('../services/job.service');
const jobRepository = require('../repositories/job.repository');

// Handles the HTTP request to create a new job description
async function createJob(req, res, next) {
  try {
    let title = req.body.title;
    let content = req.body.content;

    if (req.file) {
      const extracted = await jobService.extractJobFromFile(req.file, title);
      title = extracted.title;
      content = extracted.content;
    }

    const result = await jobService.createJob(title, content);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(201).json(result.data);
  } catch (error) {
    if (
      error.message.includes('format') ||
      error.message.includes('supported') ||
      error.message.includes('readable') ||
      error.message.includes('limit') ||
      error.message.includes('empty') ||
      error.message.includes('structure')
    ) {
      error.status = 400;
    }
    next(error);
  }
}

// Handles the HTTP request to list all job descriptions
async function listJobs(req, res, next) {
  try {
    const jobs = await jobRepository.findAll();
    return res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
}

// Handles the HTTP request to retrieve a single job description
async function getJob(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid job identifier.' });
    }
    const job = await jobRepository.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job description not found.' });
    }
    return res.status(200).json(job);
  } catch (error) {
    next(error);
  }
}

// Handles the HTTP request to delete a job description and its screening results
async function deleteJob(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid job identifier.' });
    }
    const result = await jobService.deleteJob(id);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createJob,
  listJobs,
  getJob,
  deleteJob,
};
