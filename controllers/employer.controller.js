const Employer = require('../models/employer.model');

// Create Company Profile (only for employers)
exports.createProfile = async (req, res) => {
  try {
    // Check if the user has the employer role
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can create a profile.' });
    }

    const { companyName, description, location, logo } = req.body;

    // Check if the profile already exists for this employer
    let employer = await Employer.findOne({ user: req.user.id });
    if (employer) {
      return res.status(400).json({ message: 'Profile already exists.' });
    }

    // Create new profile
    employer = await Employer.create({
      user: req.user.id,
      companyName,
      description,
      location,
      logo,
    });

    res.status(201).json(employer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating profile', error });
  }
};

// Update Company Profile (only for employers)
exports.updateProfile = async (req, res) => {
  try {
    // Check if the user has the employer role
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can update a profile.' });
    }

    const { companyName, description, location, logo } = req.body;

    let employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    // Update profile fields if provided
    employer.companyName = companyName || employer.companyName;
    employer.description = description || employer.description;
    employer.location = location || employer.location;
    employer.logo = logo || employer.logo;
    employer = await employer.save();

    res.status(200).json(employer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

// Get Company Profile (only for employers)
exports.getProfile = async (req, res) => {
    try {
      // Check if the user has the employer role
      if (req.user.role !== 'employer') {
        return res.status(403).json({ message: 'Access denied. Only employers can access the company profile.' });
      }
  
      const employer = await Employer.findOne({ user: req.user.id });
      if (!employer) {
        return res.status(404).json({ message: 'Company profile not found' });
      }
  
      res.status(200).json(employer);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching profile', error });
    }
  };

// Post a New Job (only for employers)
exports.postJob = async (req, res) => {
  try {
    // Check if the user has the employer role
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can post a job.' });
    }

    const { title, description, requiredSkills, salary, workHours, location } = req.body;

    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) return res.status(404).json({ message: 'Company profile not found' });

    const jobPosting = {
      title,
      description,
      requiredSkills,
      salary,
      workHours,
      location,
    };

    employer.jobPostings.push(jobPosting);
    await employer.save();

    res.status(201).json({mesage: "Job posted successfully",jobPosting});
  } catch (error) {
    res.status(500).json({ message: 'Error posting job', error });
  }
};

// Get All Job Postings for an Employer (only for employers)
exports.getAllJobs = async (req, res) => {
  try {
    // Check if the user has the employer role
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can view job postings.' });
    }

    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) return res.status(404).json({ message: 'Company profile not found' });

    res.status(200).json(employer.jobPostings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job postings', error });
  }
};

// Update a Job Posting (only for employers)
exports.updateJob = async (req, res) => {
    try {
      if (req.user.role !== 'employer') {
        return res.status(403).json({ message: 'Access denied. Only employers can update job postings.' });
      }
  
      const { jobId } = req.params;
      const { title, description, requiredSkills, salary, workHours, location } = req.body;
  
      const employer = await Employer.findOne({ user: req.user.id });
      if (!employer) return res.status(404).json({ message: 'Company profile not found' });
  
      const job = employer.jobPostings.id(jobId);
      if (!job) return res.status(404).json({ message: 'Job posting not found' });
  
      // Update job fields if provided
      job.title = title || job.title;
      job.description = description || job.description;
      job.requiredSkills = requiredSkills || job.requiredSkills;
      job.salary = salary || job.salary;
      job.workHours = workHours || job.workHours;
      job.location = location || job.location;
  
      await employer.save();
      res.status(200).json({ message: 'Job updated successfully', job });
    } catch (error) {
      res.status(500).json({ message: 'Error updating job', error });
    }
  };
  
  // Delete a Job Posting (only for employers)
exports.deleteJob = async (req, res) => {
    try {
      // Check if the user has the employer role
      if (req.user.role !== 'employer') {
        return res.status(403).json({ message: 'Access denied. Only employers can delete job postings.' });
      }
  
      const { jobId } = req.params;
  
      // Find the employer's profile
      const employer = await Employer.findOne({ user: req.user.id });
      if (!employer) {
        return res.status(404).json({ message: 'Company profile not found' });
      }
  
      // Find the job within the employer's jobPostings array
      const jobIndex = employer.jobPostings.findIndex(job => job._id.toString() === jobId);
  
      if (jobIndex === -1) {
        return res.status(404).json({ message: 'Job not found' });
      }
  
      // Remove the job from the jobPostings array
      employer.jobPostings.splice(jobIndex, 1);
      await employer.save();
  
      res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting job', error });
    }
  };
  