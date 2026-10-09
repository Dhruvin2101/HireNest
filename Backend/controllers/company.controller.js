import mongoose from "mongoose";
import { Company } from "../models/company.model.js";
import getDataUri from "../utils/dataURI.js";
import cloudinary from "../utils/cloudinary.js";
import { isHttpUrl, str } from "../utils/validators.js";

const badRequest = (res, message) =>
  res.status(400).json({ message, success: false });

const notFound = (res) =>
  res.status(404).json({ message: "Company not found", success: false });

const NAME_MAX = 80;

//#region Register Company
export const registerCompany = async (req, res) => {
  try {
    const companyName = str(req.body.companyName);
    if (!companyName) return badRequest(res, "Company name is required");
    if (companyName.length > NAME_MAX) {
      return badRequest(res, `Company name can be at most ${NAME_MAX} characters`);
    }

    let company = await Company.findOne({ name: companyName });
    if (company) return badRequest(res, "Company already exists");

    company = await Company.create({
      name: companyName,
      userId: req.id,
    });
    return res.status(201).json({
      message: "Company registered successfully",
      company,
      success: true,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) return badRequest(res, "Company already exists");
    return res
      .status(500)
      .json({ message: "Error registering company", success: false });
  }
};
//#endregion

//#region Get Company
export const getCompany = async (req, res) => {
  try {
    // an empty list is a valid result, not a 404
    const companies = await Company.find({ userId: req.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Companies fetched successfully",
      companies,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error fetching company", success: false });
  }
};
//#endregion

// #region Company by ID
export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    if (!mongoose.isValidObjectId(companyId)) return notFound(res);

    // recruiters can only see their own companies
    const company = await Company.findOne({ _id: companyId, userId: req.id });
    if (!company) return notFound(res);

    return res.status(200).json({
      message: "Company fetched successfully",
      company,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error fetching company", success: false });
  }
};
// #endregion

// #region Update Company
export const updateCompany = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    const name = str(req.body.name);
    const description = str(req.body.description);
    const website = str(req.body.website);
    const location = str(req.body.location);

    if (!name) return badRequest(res, "Company name is required");
    if (name.length > NAME_MAX) {
      return badRequest(res, `Company name can be at most ${NAME_MAX} characters`);
    }
    if (description.length > 1000) {
      return badRequest(res, "Description can be at most 1000 characters");
    }
    // only http(s) links, so the website can be rendered as a safe link
    if (website && !isHttpUrl(website)) {
      return badRequest(res, "Website must start with http:// or https://");
    }
    if (location.length > 100) {
      return badRequest(res, "Location can be at most 100 characters");
    }

    // check ownership before uploading anything
    const existing = await Company.exists({ _id: req.params.id, userId: req.id });
    if (!existing) return notFound(res);

    let logo;
    if (req.file) {
      const cloudResponse = await cloudinary.uploader.upload(getDataUri(req.file).content, {
        folder: "company-logos",
      });
      logo = cloudResponse.secure_url;
    }

    const updateData = {
      name,
      description,
      website,
      location,
      ...(logo && { logo }),
    };

    // only the recruiter who registered the company can update it
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, userId: req.id },
      updateData,
      { new: true },
    );
    if (!company) return notFound(res);

    return res.status(200).json({
      message: "Company updated successfully",
      company,
      success: true,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return badRequest(res, "Another company already uses this name");
    }
    // generic message: don't leak internal error details to the client
    return res.status(500).json({
      message: "Error updating company",
      success: false,
    });
  }
};
// #endregion
