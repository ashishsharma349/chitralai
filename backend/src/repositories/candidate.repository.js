const Candidate = require('../models/candidate.model');

// Finds a candidate by lowercase email or creates a new candidate within transaction
async function findOrCreateByEmail(data, transaction = null) {
  const emailLower = data.email.trim().toLowerCase();
  const [candidate] = await Candidate.findOrCreate({
    where: { email: emailLower },
    defaults: {
      name: data.name.trim(),
      phone: data.phone ? data.phone.trim() : null,
    },
    transaction,
  });
  return candidate;
}

module.exports = {
  findOrCreateByEmail,
};
