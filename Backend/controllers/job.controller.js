import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { User } from "../models/user.model.js";

const COMPANY_PUBLIC_FIELDS = "name logo location website description";
const JOB_LIST_LIMIT = 100;

// escape regex special chars so searches like "c++" don't throw
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// #region Admin

// Validates the job form fields shared by create and update.
// Returns { error } with a message, or { data } ready to save (without company/created_by).
const JOB_FIELDS = [
  "title",
  "description",
  "requirements",
  "salary",
  "location",
  "jobType",
  "experience",
  "position",
  "companyId",
];
const buildJobData = (body) => {
  for (const field of JOB_FIELDS) {
    // check for missing/empty rather than falsy so 0 years experience is allowed
    const value = body[field];
    if (value === undefined || value === null || String(value).trim() === "") {
      return { error: `${field} is required` };
    }
  }

  const salary = Number(body.salary);
  const experience = Number(body.experience);
  const position = Number(body.position);
  if ([salary, experience].some((n) => Number.isNaN(n) || n < 0)) {
    return { error: "Salary and experience must be 0 or more" };
  }
  if (!Number.isInteger(position) || position < 1) {
    return { error: "Positions must be a whole number of at least 1" };
  }
  if (!mongoose.isValidObjectId(body.companyId)) {
    return { error: "Invalid company" };
  }

  const requirements = Array.isArray(body.requirements)
    ? body.requirements
    : String(body.requirements)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return {
    data: {
      title: String(body.title).trim(),
      description: String(body.description).trim(),
      requirements,
      salary,
      location: String(body.location).trim(),
      jobType: String(body.jobType).trim(),
      experienceLevel: experience,
      position,
    },
  };
};

// #region Create Job
export const createJob = async (req, res) => {
  try {
    const userId = req.id;
    const { error, data } = buildJobData(req.body);
    if (error) {
      return res.status(400).json({ message: error, success: false });
    }

    // recruiters can only post jobs for companies they registered
    const company = await Company.findOne({ _id: req.body.companyId, userId });
    if (!company) {
      return res.status(403).json({
        message: "You can only post jobs for your own company",
        success: false,
      });
    }

    const job = await Job.create({
      ...data,
      company: company._id,
      created_by: userId,
    });

    return res
      .status(201)
      .json({ message: "Job created successfully", success: true, job });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error creating job", success: false });
  }
};
// #endregion

// #region Update Job
export const updateJob = async (req, res) => {
  try {
    const userId = req.id;
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Job not found", success: false });
    }
    const { error, data } = buildJobData(req.body);
    if (error) {
      return res.status(400).json({ message: error, success: false });
    }

    // the job and the (possibly new) company must both belong to this recruiter
    const company = await Company.findOne({ _id: req.body.companyId, userId });
    if (!company) {
      return res.status(403).json({
        message: "You can only post jobs for your own company",
        success: false,
      });
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, created_by: userId },
      { ...data, company: company._id },
      { new: true },
    ).populate({ path: "company" });

    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    return res
      .status(200)
      .json({ message: "Job updated successfully", success: true, job });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error updating job", success: false });
  }
};
// #endregion

// #region Delete Job
export const deleteJob = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Job not found", success: false });
    }
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      created_by: req.id,
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    // clean up everything that pointed at this job
    await Application.deleteMany({ job: job._id });
    await User.updateMany(
      { savedJobs: job._id },
      { $pull: { savedJobs: job._id } },
    );

    return res
      .status(200)
      .json({ message: "Job deleted successfully", success: true, jobId: job._id });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error deleting job", success: false });
  }
};
// #endregion

// #region Get Admin Jobs
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId })
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });

    // an empty list is a valid result, not a 404
    return res.status(200).json({
      message: "Admin jobs fetched successfully",
      success: true,
      jobs,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error fetching admin jobs", success: false });
  }
};
// #endregion

// #endregion

// #region User
// #region Get All Jobs
export const getAllJobs = async (req, res) => {
  try {
    // Match word by word so "Front End Developer" also finds "Frontend Developer":
    // every word must appear in at least one of the searchable fields.
    const words = String(req.query.keyword || "")
      .slice(0, 100) // long keywords only cost CPU
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 10)
      .map(escapeRegex);
    const searchFields = ["title", "description", "location", "jobType", "requirements"];
    const query = words.length
      ? {
          $and: words.map((word) => ({
            $or: searchFields.map((field) => ({
              [field]: { $regex: word, $options: "i" },
            })),
          })),
        }
      : {};

    // lean + only the fields job cards need; newest first, capped to keep responses small
    const jobs = await Job.find(query)
      .select("-applications -__v")
      .populate({ path: "company", select: COMPANY_PUBLIC_FIELDS })
      .sort({ createdAt: -1 })
      .limit(JOB_LIST_LIMIT)
      .lean();

    return res
      .status(200)
      .json({ message: "Jobs fetched successfully", success: true, jobs });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error fetching jobs", success: false });
  }
};
// #endregion

// #region Get Job By ID
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(404).json({ message: "Job not found", success: false });
    }
    const job = await Job.findById(jobId)
      .select("-__v")
      .populate({ path: "company", select: COMPANY_PUBLIC_FIELDS })
      .lean();

    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    // Public page: send the applicant count, not the applications themselves.
    // hasApplied is only true for the logged-in student who applied.
    const applicantCount = job.applications?.length || 0;
    const hasApplied = req.id
      ? Boolean(await Application.exists({ job: job._id, applicant: req.id }))
      : false;
    delete job.applications;

    return res.status(200).json({
      message: "Job fetched successfully",
      success: true,
      job: { ...job, applicantCount, hasApplied },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error fetching job", success: false });
  }
};
// #endregion

// #endregion
