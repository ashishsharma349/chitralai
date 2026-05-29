const parserService = require('../services/parser.service');
const candidateRepository = require('../repositories/candidate.repository');
const resumeRepository = require('../repositories/resume.repository');
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

// Handles upload of multiple resumes and parses their text in a transaction
async function uploadAndParseResumes(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { jobId } = req.body;
    if (!jobId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Job description identifier is required.' });
    }
    if (!req.files || req.files.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'At least one resume file must be uploaded.' });
    }

    const parsedResults = [];
    for (const file of req.files) {
      const extractedText = await parserService.extractText(file.buffer, file.mimetype, file.originalname);
      const contactInfo = extractContactInfo(extractedText, file.originalname);
      const candidate = await candidateRepository.findOrCreateByEmail(contactInfo, transaction);
      await resumeRepository.create({
        candidateId: candidate.id,
        fileName: file.originalname,
        fileType: file.mimetype,
        extractedText,
      }, transaction);

      parsedResults.push({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        fileName: file.originalname,
        textLength: extractedText.length,
      });
    }

    await transaction.commit();
    return res.status(201).json({
      message: 'Resumes successfully uploaded and processed.',
      results: parsedResults,
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

module.exports = {
  uploadAndParseResumes,
};
