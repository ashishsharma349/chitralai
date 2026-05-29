const TECH_KEYWORDS = [
  'javascript', 'python', 'java', 'react', 'node', 'express', 'mysql', 'postgresql', 'mongodb',
  'docker', 'aws', 'kubernetes', 'html', 'css', 'typescript', 'angular', 'vue', 'redux', 'git',
  'ci/cd', 'rest api', 'graphql', 'next.js', 'redis', 'elasticsearch', 'sequelize', 'mongoose',
  'testing', 'jest', 'agile', 'scrum', 'c++', 'c#', 'php', 'ruby', 'rails', 'django', 'flask',
  'spring', 'cloud', 'devops', 'jenkins', 'gcp', 'azure', 'serverless', 'microservices'
];

// Computes compatibility score and extracts matching/missing metrics locally
function scoreLocally(resumeText, jdText) {
  const cleanResume = resumeText.toLowerCase();
  const cleanJd = jdText.toLowerCase();

  const jdSkills = TECH_KEYWORDS.filter(skill => cleanJd.includes(skill));
  const resumeSkills = TECH_KEYWORDS.filter(skill => cleanResume.includes(skill));

  const matched = jdSkills.filter(skill => resumeSkills.includes(skill));
  const missing = jdSkills.filter(skill => !resumeSkills.includes(skill));

  const jdWords = new Set(cleanJd.split(/\W+/).filter(w => w.length > 2));
  const resumeWords = new Set(cleanResume.split(/\W+/).filter(w => w.length > 2));
  
  const intersection = new Set([...jdWords].filter(w => resumeWords.has(w)));
  const union = new Set([...jdWords, ...resumeWords]);
  const jaccard = union.size > 0 ? (intersection.size / union.size) : 0;

  const baseScore = jdSkills.length > 0 ? (matched.length / jdSkills.length) * 80 : 40;
  const finalScore = Math.min(100, Math.max(0, Math.round(baseScore + jaccard * 100)));

  const hasDegree = cleanResume.includes('degree') || cleanResume.includes('bachelor') || cleanResume.includes('master') || cleanResume.includes('b.s') || cleanResume.includes('m.s') || cleanResume.includes('ph.d');
  const education = hasDegree ? 'Likely Aligned (Degree keywords found)' : 'Unspecified or self-taught path';

  const expMatch = cleanResume.match(/(\d+)\+?\s*years?/);
  const experience = expMatch ? `Found candidate mention of ${expMatch[1]}+ years experience` : 'Experience length not clearly specified';

  return {
    score: finalScore,
    skillsMatch: matched.map(s => s.toUpperCase()),
    skillsMissing: missing.map(s => s.toUpperCase()),
    experienceRelevance: experience,
    educationAlignment: education,
    rationale: `Local NLP Fallback Evaluation: Candidate matched ${matched.length} out of ${jdSkills.length} key requirements identified in the job description with a Jaccard word similarity index of ${(jaccard * 100).toFixed(1)}%.`
  };
}

module.exports = {
  scoreLocally
};
