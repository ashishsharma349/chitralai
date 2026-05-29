const express = require('express');
const jobController = require('../controllers/job.controller');

const router = express.Router();

router.post('/', jobController.createJob);
router.get('/', jobController.listJobs);
router.get('/:id', jobController.getJob);

module.exports = router;
