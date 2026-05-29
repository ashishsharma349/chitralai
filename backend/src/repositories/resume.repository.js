const Resume = require('../models/resume.model');

// Stores a new resume metadata and extracted text in the database
async function create(data, transaction = null) {
  return await Resume.create({
    candidateId: data.candidateId,
    fileName: data.fileName,
    fileType: data.fileType,
    extractedText: data.extractedText,
  }, { transaction });
}

module.exports = {
  create,
};
