const mongoose = require('mongoose');

// Define the Job Seeker Profile Schema
const jobSeekerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: String }, // URL or path to the resume file
  skills: [{ type: String }], // Skills such as JavaScript, Node.js, etc.
  experience: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    startDate: Date,
    endDate: Date
  }],
  jobPreferences: {
    location: String,
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Remote'] },
    salaryExpectation: Number,
    desiredIndustry: String
  },
  applications: [{
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    appliedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Applied', 'Interviewing', 'Hired', 'Rejected'], default: 'Applied' }
  }]
});

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);
