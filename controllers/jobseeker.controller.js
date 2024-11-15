const JobSeeker = require('../models/jobseeker.model');
const Employer= require('../models/employer.model');

// Create Job Seeker Profile
const createProfile = async (req, res) => {
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
      jobPreferences
    });

    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update Job Seeker Profile
const updateJobSeekerProfile = async (req, res) => {
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
    res.status(200).json(jobSeeker);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


const searchJobs = async (req, res) => {
  try {
    // Check if the user has the jobseeker role
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Access denied. Only job seekers can search for jobs.' });
    }

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

    // Check if any jobs match the search criteria
    if (jobs.length === 0) {
      return res.status(200).json({ message: "No jobs found matching the search criteria.", jobs: [] });
    }

    // Return the matching job postings
    res.status(200).json({ jobs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error searching jobs', error });
  }
};

module.exports = {createProfile, updateJobSeekerProfile, searchJobs};

