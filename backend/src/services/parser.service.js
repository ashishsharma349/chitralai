const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Extracts plaintext from a PDF document buffer
async function parsePdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

// Extracts plaintext from a DOCX document buffer
async function parseDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// Coordinates document parsing by checking file types and enforcing length constraints
async function extractText(fileBuffer, mimeType, originalName) {
  let text = '';
  const isPdf = mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf');
  const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || originalName.toLowerCase().endsWith('.docx');
  const isDoc = mimeType === 'application/msword' || originalName.toLowerCase().endsWith('.doc');

  if (isDoc) {
    throw new Error('Legacy .doc format is not supported. Please save the document as .docx or .pdf.');
  }
  if (isPdf) {
    text = await parsePdf(fileBuffer);
  } else if (isDocx) {
    text = await parseDocx(fileBuffer);
  } else {
    throw new Error('Unsupported file format. Only PDF and DOCX files are allowed.');
  }

  const cleanedText = text.replace(/\s+/g, ' ').trim();
  if (!cleanedText) {
    throw new Error('The uploaded document contains no readable text.');
  }
  if (cleanedText.length > 50000) {
    throw new Error('Document exceeds maximum length limit of 50,000 characters.');
  }
  return cleanedText;
}

module.exports = {
  extractText,
};
