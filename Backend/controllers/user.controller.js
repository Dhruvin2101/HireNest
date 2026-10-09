import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/dataURI.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import {
  PASSWORD_MIN,
  isEmail,
  isPhone,
  normaliseEmail,
  normalisePhone,
  str,
} from "../utils/validators.js";

// Browsers reject SameSite=None cookies that aren't Secure, so only use "none"
// in production (HTTPS). localhost:5173 -> localhost:8000 is same-site, so "lax" works in dev.
const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  path: "/",
};

// The user fields that are safe to send to the browser (never the password hash).
const publicUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role,
  profile: user.profile,
  savedJobs: user.savedJobs,
});

const badRequest = (res, message) =>
  res.status(400).json({ message, success: false });

//#region User Registration
export const register = async (req, res) => {
  try {
    const fullName = str(req.body.fullName);
    const email = normaliseEmail(req.body.email);
    const phoneNumber = normalisePhone(req.body.phoneNumber);
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const role = str(req.body.role);

    if (!fullName || !email || !phoneNumber || !password || !role) {
      return badRequest(res, "All fields are required");
    }
    if (fullName.length < 2 || fullName.length > 60) {
      return badRequest(res, "Full name must be 2-60 characters");
    }
    if (!isEmail(email)) return badRequest(res, "Please enter a valid email address");
    if (!isPhone(phoneNumber)) {
      return badRequest(res, "Phone number must be 10-15 digits");
    }
    if (password.length < PASSWORD_MIN || password.length > 128) {
      return badRequest(res, `Password must be at least ${PASSWORD_MIN} characters`);
    }
    if (!["student", "recruiter"].includes(role)) {
      return badRequest(res, "Please choose Student or Recruiter");
    }

    const user = await User.findOne({ email });
    if (user) {
      return badRequest(res, "User already exists");
    }

    // profile photo is optional; only upload after we know the email is free
    let profilePhoto = "";
    if (req.file) {
      const cloudResponse = await cloudinary.uploader.upload(getDataUri(req.file).content, {
        folder: "profile-photos",
      });
      profilePhoto = cloudResponse.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      email,
      phoneNumber: Number(phoneNumber.replace("+", "")),
      password: hashedPassword,
      role,
      profile: {
        profilePhoto,
      },
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) return badRequest(res, "User already exists");

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//#endregion

//#region User Login
export const login = async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const role = str(req.body.role);
    if (!email || !password || !role) {
      return badRequest(res, "All fields are required");
    }

    // One generic message for unknown email, wrong password or wrong role,
    // so the login form can't be used to find out which emails are registered.
    const invalid = () => badRequest(res, "Incorrect email, password or role");

    const user = await User.findOne({ email });
    if (!user) return invalid();
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching || user.role !== role) return invalid();

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("token", token, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back, ${user.fullName}!`,
        user: publicUser(user),
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//#endregion

//#region User Logout
export const logout = async (req, res) => {
  return res
    .status(200)
    .clearCookie("token", cookieOptions)
    .json({ message: "Logged out successfully", success: true });
};

//#endregion

//#region Update Profile

const uploadResume = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", format: "pdf", folder: "resumes" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // only fields that were actually sent are changed
    const has = (field) => req.body[field] !== undefined;
    const fullName = str(req.body.fullName);
    const email = normaliseEmail(req.body.email);
    const phoneNumber = normalisePhone(req.body.phoneNumber);
    const bio = str(req.body.bio);

    if (has("fullName") && (fullName.length < 2 || fullName.length > 60)) {
      return badRequest(res, "Full name must be 2-60 characters");
    }
    if (has("email") && !isEmail(email)) {
      return badRequest(res, "Please enter a valid email address");
    }
    if (has("phoneNumber") && !isPhone(phoneNumber)) {
      return badRequest(res, "Phone number must be 10-15 digits");
    }
    if (bio.length > 300) return badRequest(res, "Bio can be at most 300 characters");

    let skills;
    if (has("skills")) {
      skills = str(req.body.skills)
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
      if (skills.length > 30 || skills.some((skill) => skill.length > 40)) {
        return badRequest(res, "Up to 30 skills, each at most 40 characters");
      }
    }

    // email is unique, so check before saving instead of failing with a 500
    if (has("email") && email !== user.email) {
      const emailTaken = await User.exists({ email });
      if (emailTaken) {
        return badRequest(res, "This email is already used by another account");
      }
    }

    const resumeFile = req.files?.file?.[0];
    const photoFile = req.files?.profilePhoto?.[0];
    if (resumeFile) {
      const uploadResult = await uploadResume(resumeFile);
      user.profile.resume = uploadResult.secure_url;
      user.profile.resumeOriginalName = resumeFile.originalname.slice(0, 120);
    }
    if (photoFile) {
      const uploadResult = await cloudinary.uploader.upload(getDataUri(photoFile).content, {
        folder: "profile-photos",
      });
      user.profile.profilePhoto = uploadResult.secure_url;
    }

    if (has("fullName")) user.fullName = fullName;
    if (has("phoneNumber")) user.phoneNumber = Number(phoneNumber.replace("+", ""));
    if (has("email")) user.email = email;
    if (has("bio")) user.profile.bio = bio;
    if (skills) user.profile.skills = skills;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: publicUser(user),
      success: true,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return badRequest(res, "This email is already used by another account");
    }

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//#endregion

//#region Saved Jobs (student bookmarks)

// GET /saved-jobs -> full job objects (with company) for the Saved Jobs page
export const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.id).populate({
      path: "savedJobs",
      populate: { path: "company" },
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    // drop references to jobs that have since been deleted
    const savedJobs = user.savedJobs.filter(Boolean);
    return res.status(200).json({ success: true, savedJobs });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Failed to get saved jobs", success: false });
  }
};

// PUT /saved-jobs/:jobId -> save; DELETE /saved-jobs/:jobId -> unsave.
// Both return the updated list of saved job ids so the UI can update the bookmark icons.
const changeSavedJob = (action) => async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    if (action === "save") {
      const job = await Job.exists({ _id: jobId });
      if (!job) {
        return res
          .status(404)
          .json({ message: "Job not found", success: false });
      }
    }

    const update =
      action === "save"
        ? { $addToSet: { savedJobs: jobId } }
        : { $pull: { savedJobs: jobId } };
    const user = await User.findByIdAndUpdate(req.id, update, { new: true });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    return res.status(200).json({
      message: action === "save" ? "Job saved for later" : "Job removed from saved",
      success: true,
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Failed to update saved jobs", success: false });
  }
};

export const saveJob = changeSavedJob("save");
export const unsaveJob = changeSavedJob("unsave");

//#endregion
