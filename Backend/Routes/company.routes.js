import express from "express";
import {
  registerCompany,
  getCompany,
  getCompanyById,
  updateCompany,
} from "../controllers/company.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { uploadImage } from "../middlewares/multer.js";

const router = express.Router();
const isRecruiter = authorizeRoles("recruiter");

router.route("/registerCompany").post(isAuthenticated, isRecruiter, registerCompany);
router.route("/getCompanies").get(isAuthenticated, isRecruiter, getCompany);
router.route("/getCompany/:id").get(isAuthenticated, isRecruiter, getCompanyById);
router
  .route("/updateCompany/:id")
  .put(isAuthenticated, isRecruiter, uploadImage, updateCompany);

export default router;
