const { GoogleGenerativeAI } = require('@google/generative-ai');
const nlpService = require('./nlp.service');

const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest'
];

// Screen resume against job description using Gemini models or NLP fallback
async function screenResume(resumeText, jdText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || process.env.NODE_ENV === 'test') {
    return nlpService.scoreLocally(resumeText, jdText);
  }

  const prompt = `Evaluate the suitability of the candidate's resume against the Job Description (JD).
Return a JSON object containing the following keys:
- score (integer between 0 and 100 representing overall compatibility)
- skillsMatch (array of uppercase strings containing matched skills)
- skillsMissing (array of uppercase strings containing skills required in JD but missing in resume)
- experienceRelevance (short description of experience fit)
- educationAlignment (short description of education fit)
- rationale (brief explanation of why this score was assigned)

Job Description:
${jdText}

Candidate Resume:
${resumeText}`;

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      if (parsed && typeof parsed.score === 'number') {
        return {
          score: Math.min(100, Math.max(0, parsed.score)),
          skillsMatch: Array.isArray(parsed.skillsMatch) ? parsed.skillsMatch.map(s => String(s).toUpperCase()) : [],
          skillsMissing: Array.isArray(parsed.skillsMissing) ? parsed.skillsMissing.map(s => String(s).toUpperCase()) : [],
          experienceRelevance: parsed.experienceRelevance || 'No experience details extracted.',
          educationAlignment: parsed.educationAlignment || 'No education details extracted.',
          rationale: parsed.rationale || 'Evaluation completed successfully.'
        };
      }
    } catch (error) {
      console.warn(`Gemini model ${modelName} failed or was throttled:`, error.message);
    }
  }

  console.warn('All Gemini models failed or were rate-limited. Falling back to local NLP engine.');
  return nlpService.scoreLocally(resumeText, jdText);
}

module.exports = {
  screenResume
};
