const Employer = require('../models/employer.model');
const Application = require('../models/application.model');
const nodemailer = require('nodemailer');
const config= require('../config/keys');

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

    res.status(201).json({message: 'Profile created successfully', employer});
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

    res.status(200).json({message: 'Profile updated successfully', employer});
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
  
      res.status(200).json({message: 'Employers fetch successfully', employer});
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
  

  // View Applications for a Specific Job Posting
exports.viewApplications = async (req, res) => {
  try {
    // Check if the user has the employer role
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can view applications.' });
    }

    const { jobId } = req.params;

    // Find the employer's profile
    const employer = await Employer.findOne({ user: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found.' });
    }

    // Check if the job belongs to the employer
    const job = employer.jobPostings.id(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found.' });
    }

    // Fetch all applications for the specific job posting
    const applications = await Application.find({ jobPosting: jobId })
      // .populate('jobSeeker', 'name email') // Include basic job seeker details
      // .select('resume coverLetter appliedAt');

    res.status(200).json({
      message: 'Applications fetched successfully.',
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications.', error });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can update application statuses.' });
    }

    const { applicationId } = req.params; // Get the application ID from route parameters
    const { status } = req.body; // Get the new status from the request body

    // Validate status
    const validStatuses = ['pending', 'interviewed', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}` });
    }

    // Update the application status
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ message: 'Application status updated successfully.', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.', error });
  }
};

// exports.scheduleInterview = async (req, res) => {
//   try {
//     if (req.user.role !== 'employer') {
//       return res.status(403).json({ message: 'Access denied. Only employers can schedule interviews.' });
//     }

//     const { applicationId } = req.params;
//     const { date, time, mode, location, link } = req.body;

//     // Validate mode
//     if (!['online', 'in-person'].includes(mode.toLowerCase())) {
//       return res.status(400).json({ message: 'Invalid interview mode. Use "online" or "in-person".' });
//     }

//     // Find application
//     const application = await Application.findById(applicationId).populate('jobSeeker', 'email name');
//     if (!application) {
//       return res.status(404).json({ message: 'Application not found.' });
//     }

//     // Check if jobSeeker is populated
//     if (!application.jobSeeker) {
//       return res.status(400).json({ message: 'Job seeker details are missing in the application.' });
//     }

//     // Update interview details
//     application.interview = {
//       scheduled: true,
//       date,
//       time,
//       mode: mode.toLowerCase(),
//       location: mode.toLowerCase() === 'in-person' ? location : null,
//       link: mode.toLowerCase() === 'online' ? link : null,
//     };
//     await application.save();

//     // Send email notification
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: config.emailCredentials.EMAIL_USER,
//         pass: config.emailCredentials.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: config.emailCredentials.EMAIL_USER,
//       to: application.jobSeeker.email,
//       subject: 'Interview Scheduled',
//       text: `Dear ${application.jobSeeker.name},\n\nYour interview for the job has been scheduled.\n\nDetails:\n- Date: ${date}\n- Time: ${time}\n- Mode: ${mode}\n- Location: ${location || 'N/A'}\n- Link: ${link || 'N/A'}\n\nBest regards,\nYour Company`,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: 'Interview scheduled successfully and notification sent.', application });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error scheduling interview.', error });
//   }
// };


exports.scheduleInterview = async (req, res) => {
  try {
   // Ensure the employer is logged in
    // if (!req.user || !req.user.companyName) {
    //   return res.status(400).json({ message: 'Employer information missing or user not authenticated.' });
    // }

    const { applicationId, date, time, mode, location, link } = req.body;

    // Validate required fields
    if (!applicationId || !date || !time || !mode) {
      return res.status(400).json({ message: 'All fields are required: applicationId, date, time, mode.' });
    }

    // Find the application by its ID
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Check if the interview is already scheduled
    if (application.interview.scheduled) {
      return res.status(400).json({ message: 'Interview is already scheduled for this application.' });
    }

    // Update the application with the interview details
    application.interview.scheduled = true;
    application.interview.date = date;
    application.interview.time = time;
    application.interview.mode = mode;
    application.interview.location = location;
    application.interview.link = link;

    // Save the updated application
    await application.save();

    // Send email notification to the job seeker (applicant)
    const jobSeeker = application.jobSeeker; // Assuming jobSeeker has an email field
    const employer = req.user; // Employer's info

    // Set up the email transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.emailCredentials.EMAIL_USER, // Sender's email (from config)
        pass: config.emailCredentials.EMAIL_PASS, // Sender's email password (from config)
      },
    });

    // Define the email content
    const mailOptions = {
      from: config.emailCredentials.EMAIL_USER, // Sender's email
      to: jobSeeker.email, // Recipient's email (job seeker)
      subject: 'Interview Scheduled - ' + employer.companyName,
      text: `Dear ${jobSeeker.name},\n\nYou have been selected for an interview for the position at ${employer.companyName}.\n\nInterview Details:\nDate: ${date}\nTime: ${time}\nMode: ${mode}\nLocation: ${location || 'To be discussed'}\nLink: ${link || 'N/A'}\n\nBest regards,\n${employer.companyName}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond with success
    res.status(200).json({ message: 'Interview scheduled successfully and notification sent to the applicant.', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error scheduling interview', error });
  }
};

