const mongoose = require('mongoose');

// Define the Job Posting Schema
const jobPostingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  salary: { type: Number },
  workHours: { type: String },
  location: { type: String },
  postedAt: { type: Date, default: Date.now },
});

// Define the Employer Schema
const employerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  logo: { type: String }, // URL or path to logo image
  jobPostings: [jobPostingSchema], // Embed job postings
});

module.exports = mongoose.model('Employer', employerSchema);
