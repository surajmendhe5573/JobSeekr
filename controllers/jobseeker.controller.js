const JobSeeker = require('../models/jobseeker.model');
const Employer= require('../models/employer.model');
const Application = require('../models/application.model');
const multer = require('multer');
const path = require('path');

// Create a Job Seeker Profile
const createProfile = async (req, res) => {
  if (req.user.role !== 'jobseeker') {
    return res.status(403).json({ message: 'Access denied. Only jobseekers can create profiles.' });
  }

  const { resume, skills, experience, education, jobPreferences } = req.body;

  try {
    // Check if a profile already exists for this user
    const jobSeeker = await JobSeeker.findOne({ user: req.user.id });

    if (jobSeeker) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    // Create a new profile
    const newProfile = new JobSeeker({
      user: req.user.id,
      resume,
      skills,
      experience,
      education,
      jobPreferences,
    });

    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


// Update Job Seeker Profile
const updateJobSeekerProfile = async (req, res) => {
  if (req.user.role !== 'jobseeker') {
    return res.status(403).json({ message: 'Access denied. Only jobseekers can update profiles.' });
  }

  const { resume, skills, experience, education, jobPreferences } = req.body;

  try {
    const jobSeeker = await JobSeeker.findOne({ user: req.user.id });

    if (!jobSeeker) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update only provided fields
    jobSeeker.resume = resume || jobSeeker.resume;
    jobSeeker.skills = skills || jobSeeker.skills;
    jobSeeker.experience = experience || jobSeeker.experience;
    jobSeeker.education = education || jobSeeker.education;
    jobSeeker.jobPreferences = jobPreferences || jobSeeker.jobPreferences;

    await jobSeeker.save();
    res.status(200).json({message: 'Profile updated successfully', jobSeeker});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


const searchJobs = async (req, res) => {
  try {
    // Check if the user has the jobseeker role
    // if (req.user.role !== 'jobseeker') {
    //   return res.status(403).json({ message: 'Access denied. Only job seekers can search for jobs.' });
    // }

    const { location, requiredSkills, minSalary, maxSalary } = req.query;

    // Build a filter object based on the provided query parameters
    let filter = {};

    if (location) {
      filter['jobPostings.location'] = location;
    }

    if (requiredSkills) {
      // Split skills by comma and search for jobs that have any of the listed skills
      const skillsArray = requiredSkills.split(',').map(skill => skill.trim());
      filter['jobPostings.requiredSkills'] = { $in: skillsArray };
    }

    if (minSalary || maxSalary) {
      filter['jobPostings.salary'] = {};
      if (minSalary) filter['jobPostings.salary'].$gte = parseInt(minSalary);
      if (maxSalary) filter['jobPostings.salary'].$lte = parseInt(maxSalary);
    }

    // Find employers with job postings that match the filter criteria
    const employers = await Employer.find(filter, 'jobPostings').populate('user', 'name');

    // Extract job postings from the matched employers
    const jobs = employers.flatMap(employer => employer.jobPostings);

    if (jobs.length === 0) {
      return res.status(200).json({ message: "No jobs found matching the search criteria.", jobs: [] });
    }

    res.status(200).json({ jobs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error searching jobs', error });
  }
};


const applyForJob = async (req, res) => {
  try {
    // Check if the user is a jobseeker
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied. Only job seekers can apply for jobs.' });
    }

    const { jobPostingId } = req.params; // Get jobPostingId from route parameters
    const jobSeekerId = req.user.id; // Assume `protect` middleware adds `req.user`
    const { resume, coverLetter } = req.body;

    // Validate input
    if (!jobPostingId || !resume) {
      return res.status(400).json({ message: 'JobPostingId and Resume are required.' });
    }

    // Check if the job posting exists
    const employer = await Employer.findOne({ 'jobPostings._id': jobPostingId });
    if (!employer) {
      return res.status(404).json({ message: 'Job posting not found.' });
    }

    // Check if the job seeker has already applied
    const existingApplication = await Application.findOne({ jobSeeker: jobSeekerId, jobPosting: jobPostingId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    // Save the application
    const application = new Application({
      jobSeeker: jobSeekerId,
      jobPosting: jobPostingId,
      resume,
      coverLetter,
    });

    await application.save();

    res.status(201).json({ message: 'Application submitted successfully.', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.', error });
  }
};

// const viewApplicationStatus = async (req, res) => {
//   try {
//     // Ensure the user is a jobseeker
//     if (req.user.role !== 'jobseeker') {
//       return res.status(403).json({ message: 'Access denied. Only job seekers can view application status.' });
//     }

//     const jobSeekerId = req.user.id;

//     // Fetch all applications for the job seeker
//     const applications = await Application.find({ jobSeeker: jobSeekerId })
//       .populate('jobSeeker', 'name'); // Populate job seeker details (optional)

//     if (applications.length === 0) {
//       return res.status(200).json({ message: 'No applications found.', applications: [] });
//     }

//     // Fetch job posting details manually
//     const jobsWithDetails = await Promise.all(
//       applications.map(async (application) => {
//         const employer = await Employer.findOne(
//           { 'jobPostings._id': application.jobPosting },
//           { 'jobPostings.$': 1 } // Only return the matching jobPosting
//         );

//         return {
//           ...application.toObject(),
//           jobPosting: employer ? employer.jobPostings[0] : null,
//         };
//       })
//     );

//     res.status(200).json({ applications: jobsWithDetails });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error.', error });
//   }
// };

// View Application Status
const viewApplicationStatus = async (req, res) => {
  try {
    // Check if the user is a jobseeker
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied. Only job seekers can view application status.' });
    }

    const { jobPostingId } = req.params; // Get jobPostingId from route parameters
    const jobSeekerId = req.user.id; // Assume `protect` middleware adds `req.user`

    // Validate input
    if (!jobPostingId) {
      return res.status(400).json({ message: 'JobPostingId is required.' });
    }

    // Find the application for this job posting and job seeker
    const application = await Application.findOne({ jobSeeker: jobSeekerId, jobPosting: jobPostingId });

    if (!application) {
      return res.status(404).json({ message: 'Application not found for this job posting.' });
    }

    // Return the application status and other details
    res.status(200).json({
      message: 'Application status retrieved successfully.',
      status: application.status,  // Assuming 'status' field exists
      application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.', error });
  }
};



module.exports = { createProfile, updateJobSeekerProfile, searchJobs, applyForJob, viewApplicationStatus };

