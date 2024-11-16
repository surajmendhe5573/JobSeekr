const express = require('express');
const { createProfile, updateJobSeekerProfile, searchJobs } = require('../controllers/jobseeker.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Route to create a job seeker profile
router.post('/profile', protect, createProfile);   // create a job seeker profile
router.put('/profile', protect, updateJobSeekerProfile);   // update a job seeker profile 
router.get('/jobs', searchJobs);    // search jobs


module.exports = router;