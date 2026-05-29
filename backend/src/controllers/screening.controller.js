const parserService = require('../services/parser.service');
const candidateRepository = require('../repositories/candidate.repository');
const resumeRepository = require('../repositories/resume.repository');
const jobRepository = require('../repositories/job.repository');
const aiService = require('../services/ai.service');
const screeningRepository = require('../repositories/screening.repository');
const ScreeningResult = require('../models/screening.model');
const { sequelize } = require('../config/db');

// Helper to extract email and phone from resume text using regular expressions
function extractContactInfo(text, fileName) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  const email = emailMatch ? emailMatch[0] : `missing.${Date.now()}@example.com`;
  const phone = phoneMatch ? phoneMatch[0] : null;
  const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').trim();
  const name = cleanName || 'Unknown Candidate';

  return { name, email, phone };
}

// Handles upload of multiple resumes, parses and screens them using AI within a database transaction
async function uploadAndParseResumes(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { jobId } = req.body;
    if (!jobId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Job description identifier is required.' });
    }
    const job = await jobRepository.findById(jobId);
    if (!job) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Job description not found.' });
    }
    if (!req.files || req.files.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'At least one resume file must be uploaded.' });
    }

    const currentCount = await ScreeningResult.count({ where: { jobDescriptionId: jobId } });
    if (currentCount + req.files.length > 15) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Free tier limit reached. You can upload a maximum of 15 resumes per Job Description.' });
    }

    const processedResults = [];
    for (const file of req.files) {
      const extractedText = await parserService.extractText(file.buffer, file.mimetype, file.originalname);
      const contactInfo = extractContactInfo(extractedText, file.originalname);
      const candidate = await candidateRepository.findOrCreateByEmail(contactInfo, transaction);
      const resume = await resumeRepository.create({
        candidateId: candidate.id,
        fileName: file.originalname,
        fileType: file.mimetype,
        extractedText,
      }, transaction);

      const evaluation = await aiService.screenResume(extractedText, job.content);

      await screeningRepository.createResult({
        resumeId: resume.id,
        jobDescriptionId: job.id,
        score: evaluation.score,
        skillsMatch: evaluation.skillsMatch,
        skillsMissing: evaluation.skillsMissing,
        experienceRelevance: evaluation.experienceRelevance,
        educationAlignment: evaluation.educationAlignment,
        rationale: evaluation.rationale,
      }, transaction);

      processedResults.push({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        fileName: file.originalname,
        textLength: extractedText.length,
        score: evaluation.score,
        evaluation
      });
    }

    await transaction.commit();
    return res.status(201).json({
      message: 'Resumes successfully uploaded, processed, and screened.',
      results: processedResults,
    });
  } catch (error) {
    await transaction.rollback();
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

// Retrieves evaluation results for a specific job ID
async function getScreeningResults(req, res, next) {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    if (isNaN(jobId) || jobId <= 0) {
      return res.status(400).json({ error: 'Invalid job identifier.' });
    }
    const search = req.query.search || '';
    const results = await screeningRepository.findByJobId(jobId, { search });
    
    const formatted = results.rows.map(row => ({
      id: row.id,
      score: row.score,
      skillsMatch: row.skillsMatch,
      skillsMissing: row.skillsMissing,
      experienceRelevance: row.experienceRelevance,
      educationAlignment: row.educationAlignment,
      rationale: row.rationale,
      candidate: row.Resume?.Candidate ? {
        id: row.Resume.Candidate.id,
        name: row.Resume.Candidate.name,
        email: row.Resume.Candidate.email,
        phone: row.Resume.Candidate.phone
      } : null,
      resume: row.Resume ? {
        id: row.Resume.id,
        fileName: row.Resume.fileName,
        fileType: row.Resume.fileType
      } : null
    }));

    return res.status(200).json({
      count: results.count,
      results: formatted
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadAndParseResumes,
  getScreeningResults
};
