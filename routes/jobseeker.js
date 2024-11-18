const express = require('express');
const multer = require('multer');
const path = require('path');
const { createProfile, updateJobSeekerProfile, searchJobs, applyForJob, viewApplicationStatus } = require('../controllers/jobseeker.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Route to create a job seeker profile
router.post('/profile', protect, createProfile);   // create a job seeker profile
router.put('/profile', protect, updateJobSeekerProfile);   // update a job seeker profile 
router.get('/jobs', searchJobs);    // search jobs


// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/resumes');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });
  
  
  // Apply for a job (with file upload)
  router.post('/apply/:jobPostingId', protect, upload.fields([{ name: 'resume' }, { name: 'coverLetter' }]), applyForJob);
  router.get('/applications/status', protect, viewApplicationStatus);

  

module.exports = router;