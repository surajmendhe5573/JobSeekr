const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const employerController = require('../controllers/employer.controller');

const router = express.Router();

// Create Company Profile
router.post('/create-profile', protect, employerController.createProfile);

// Update Company Profile
router.put('/update-profile', protect, employerController.updateProfile);

// Get Company Profile
router.get('/fetch-profile', protect, employerController.getProfile);

// Post a New Job
router.post('/post-jobs', protect, employerController.postJob);

// Get All Job Postings for an Employer
router.get('/jobs', protect, employerController.getAllJobs);

// Update a Job Posting
router.put('/update-job/:jobId', protect, employerController.updateJob);

// Delete a Job Posting
router.delete('/delete-job/:jobId', protect, employerController.deleteJob);

router.get('/jobs/:jobId/applications', protect, employerController.viewApplications);

router.patch('/applications/:applicationId/status', protect, employerController.updateApplicationStatus);

router.post('/applications/:applicationId/schedule-interview', protect, employerController.scheduleInterview);
router.post('/schedule-interview', employerController.scheduleInterview);

module.exports = router;
