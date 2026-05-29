const express = require('express');
const multer = require('multer');
const jobController = require('../controllers/job.controller');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post('/', rateLimiter, upload.single('file'), jobController.createJob);
router.get('/', jobController.listJobs);
router.get('/:id', jobController.getJob);

module.exports = router;
