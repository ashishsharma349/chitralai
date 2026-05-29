const express = require('express');
const multer = require('multer');
const screeningController = require('../controllers/screening.controller');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post('/upload', rateLimiter, upload.array('resumes', 15), screeningController.uploadAndParseResumes);
router.get('/results/:jobId', screeningController.getScreeningResults);

module.exports = router;
