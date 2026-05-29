const jobRepository = require('../repositories/job.repository');
const parserService = require('../services/parser.service');

// Handles the HTTP request to create a new job description
async function createJob(req, res, next) {
  try {
    const currentCount = await jobRepository.count();
    if (currentCount >= 5) {
      return res.status(400).json({ error: 'Free tier limit reached. You can create a maximum of 5 Job Descriptions.' });
    }

    let title = req.body.title;
    let content = req.body.content;
    if (req.file) {
      const extractedText = await parserService.extractText(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
      content = extractedText;
      if (!title || !title.trim()) {
        title = req.file.originalname.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').trim();
      }
    }
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

module.exports = {
  createJob,
  listJobs,
  getJob,
};
