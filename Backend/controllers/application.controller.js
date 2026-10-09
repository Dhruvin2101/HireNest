import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

//#region Apply for a job 

export const applyForJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    // Checking if the user has already applied for the job
    const existingApplication = await Application.exists({
      applicant: userId,
      job: jobId,
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
        success: false,
      });
    }

    // checking if the job exists or not
    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    // the unique (job, applicant) index stops double-clicks from creating two applications
    const newApplication = await Application.create({
      applicant: userId,
      job: jobId,
    });

    // atomic push, so two people applying at the same moment can't overwrite each other
    await Job.updateOne(
      { _id: jobId },
      { $addToSet: { applications: newApplication._id } },
    );

    res.status(201).json({
      message: "Application submitted successfully",
      success: true,
      application: newApplication,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already applied for this job",
        success: false,
      });
    }
    res.status(500).json({ message: "Server error", success: false });
  }
};

//#endregion

//#region Get applications
export const getApplications = async (req, res) => {
  try {
    const userId = req.id;
    const applications = await Application.find({ applicant: userId })
      .populate({
        path: "job",
        select: "title company location jobType salary",
        populate: { path: "company", select: "name logo" },
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!applications) {
      return res
        .status(404)
        .json({ message: "No applications found", success: false });
    }

    return res.status(200).json({
      message: "Applications retrieved successfully",
      success: true,
      applications,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to get applications", success: false });
  }
};
//#endregion

//admin k liye -> kitne user ne apply kiya dekhne k liye
//#region Get applications for a job (Admin)

export const getApplicationsForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(404).json({ message: "Job not found", success: false });
    }
    // only the recruiter who posted the job can see its applicants
    const job = await Job.findOne({ _id: jobId, created_by: req.id }).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "applicant",
        // only what a recruiter needs; never the password hash or saved jobs
        select: "fullName email phoneNumber profile",
      },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    return res.status(200).json({
      message: "Applications retrieved successfully",
      success: true,
      job,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to get applications for the job",
      success: false,
    });
  }
};

//#endregion

//#region Update application
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    if (!mongoose.isValidObjectId(applicationId)) {
      return res
        .status(404)
        .json({ message: "Application not found", success: false });
    }

    if (!status) {
      return res
        .status(400)
        .json({ message: "Status is required", success: false });
    }

    const newStatus = String(status).toLowerCase();
    if (!["pending", "accepted", "rejected"].includes(newStatus)) {
      return res.status(400).json({
        message: "Status must be pending, accepted or rejected",
        success: false,
      });
    }

    // find the application by application ID
    const application = await Application.findOne({ _id: applicationId });

    if (!application) {
      return res
        .status(404)
        .json({ message: "Application not found", success: false });
    }

    // only the recruiter who posted the job can change the status
    const job = await Job.findOne({ _id: application.job, created_by: req.id });
    if (!job) {
      return res.status(403).json({
        message: "You can only update applications for your own jobs",
        success: false,
      });
    }

    application.status = newStatus;
    await application.save();

    res.status(200).json({
      message: "Application status updated successfully",
      success: true,
      application,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to update application status", success: false });
  }
};

// #endregion
