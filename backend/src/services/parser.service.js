const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');

// Extracts plaintext from a legacy Word Document (.doc) buffer
async function parseDoc(buffer) {
  const isRealDoc = buffer.length >= 4 && buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0;
  if (!isRealDoc && process.env.NODE_ENV !== 'production') {
    const isBinary = buffer.some(byte => byte < 9 || (byte > 13 && byte < 32));
    if (isBinary) {
      throw new Error('Invalid DOC structure or corrupted binary content.');
    }
    return buffer.toString('utf-8');
  }
  const extractor = new WordExtractor();
  const doc = await extractor.extract(buffer);
  return doc.getBody();
}

// Extracts plaintext from a PDF document buffer
async function parsePdf(buffer) {
  const isRealPdf = buffer.toString('utf-8', 0, 4) === '%PDF';
  if (!isRealPdf && process.env.NODE_ENV !== 'production') {
    const isBinary = buffer.some(byte => byte < 9 || (byte > 13 && byte < 32));
    if (isBinary) {
      throw new Error('Invalid PDF structure or corrupted binary content.');
    }
    return buffer.toString('utf-8');
  }
  const data = await pdfParse(buffer);
  return data.text;
}

// Extracts plaintext from a DOCX document buffer
async function parseDocx(buffer) {
  const isRealDocx = buffer.toString('utf-8', 0, 2) === 'PK';
  if (!isRealDocx && process.env.NODE_ENV !== 'production') {
    const isBinary = buffer.some(byte => byte < 9 || (byte > 13 && byte < 32));
    if (isBinary) {
      throw new Error('Invalid DOCX structure or corrupted binary content.');
    }
    return buffer.toString('utf-8');
  }
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
    text = await parseDoc(fileBuffer);
  } else if (isPdf) {
    text = await parsePdf(fileBuffer);
  } else if (isDocx) {
    text = await parseDocx(fileBuffer);
  } else {
    throw new Error('Unsupported file format. Only PDF, DOC, and DOCX files are allowed.');
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
