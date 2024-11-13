const express = require('express');
const { createProfile, updateJobSeekerProfile, searchJobs } = require('../controllers/jobseeker.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Route to create a job seeker profile
router.post('/profile', protect, createProfile);
router.put('/profile/update', protect, updateJobSeekerProfile);
router.get('/search-jobs', protect, searchJobs);


module.exports = router;



