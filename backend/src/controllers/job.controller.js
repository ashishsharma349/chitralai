const jobRepository = require('../repositories/job.repository');

// Handles the HTTP request to create a new job description
async function createJob(req, res, next) {
  try {
    const { title, content } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Job title is required.' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Job description content is required.' });
    }
    const newJob = await jobRepository.create({
      title: title.trim(),
      content: content.trim(),
    });
    return res.status(201).json(newJob);
  } catch (error) {
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
    if (isNaN(id)) {
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

module.exports = {
  createJob,
  listJobs,
  getJob,
};
