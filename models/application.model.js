const mongoose = require('mongoose');

// Define the Application Schema
const applicationSchema = new mongoose.Schema({
  jobSeeker: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker', required: true },
  jobPosting: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer.jobPostings', required: true },
  resume: { type: String, required: true }, // Path to the resume file
  coverLetter: { type: String }, // Path to the cover letter file (optional)
  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', applicationSchema);
