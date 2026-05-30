const jobRepository = require('../repositories/job.repository');
const parserService = require('../services/parser.service');
const { sequelize } = require('../config/db');

// Validates and sanitizes job description input data
function validateJobInput(title, content) {
  if (!title || !title.trim()) {
    return { valid: false, error: 'Job title is required.' };
  }
  if (!content || !content.trim()) {
    return { valid: false, error: 'Job description content is required.' };
  }
  if (title.trim().length < 3) {
    return { valid: false, error: 'Job title must be at least 3 characters long.' };
  }
  if (title.trim().length > 150) {
    return { valid: false, error: 'Job title must not exceed 150 characters.' };
  }
  if (content.trim().length < 50) {
    return { valid: false, error: 'Job description must be at least 50 characters. Please provide a more detailed description for accurate candidate matching.' };
  }
  const alphaCount = (content.match(/[a-zA-Z ]/g) || []).length;
  const totalLength = content.length;
  if ((alphaCount / totalLength) < 0.6) {
    return { valid: false, error: 'Job description appears to contain mostly non-text content. Please provide a readable description with requirements and responsibilities.' };
  }
  return { valid: true };
}

// Extracts text content from an uploaded JD file and resolves the title
async function extractJobFromFile(file, providedTitle) {
  const extractedText = await parserService.extractText(
    file.buffer,
    file.mimetype,
    file.originalname
  );
  const title = (providedTitle && providedTitle.trim())
    ? providedTitle
    : file.originalname.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').trim();

  return { title, content: extractedText };
}

// Creates a new job description after enforcing tier limits and validation
async function createJob(title, content) {
  const currentCount = await jobRepository.count();
  if (process.env.NODE_ENV !== 'test' && currentCount >= 5) {
    return { error: 'Free tier limit reached. You can create a maximum of 5 Job Descriptions.', status: 400 };
  }

  const validation = validateJobInput(title, content);
  if (!validation.valid) {
    return { error: validation.error, status: 400 };
  }

  const newJob = await jobRepository.create({
    title: title.trim(),
    content: content.trim(),
  });
  return { data: newJob };
}

// Deletes a job description and all its associated screening results atomically
async function deleteJob(id) {
  const transaction = await sequelize.transaction();
  try {
    const job = await jobRepository.findById(id);
    if (!job) {
      await transaction.rollback();
      return { error: 'Job description not found.', status: 404 };
    }
    await jobRepository.deleteScreeningResultsByJobId(id, transaction);
    await jobRepository.deleteById(id, transaction);
    await transaction.commit();
    return { success: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  validateJobInput,
  extractJobFromFile,
  createJob,
  deleteJob,
};
