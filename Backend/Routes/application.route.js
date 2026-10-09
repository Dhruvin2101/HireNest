import express from "express";
import {
  applyForJob,
  getApplications,
  getApplicationsForJob,
  updateApplicationStatus,
} from "../controllers/application.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";

const router = express.Router();
const isStudent = authorizeRoles("student");
const isRecruiter = authorizeRoles("recruiter");

// POST (not GET) so a link on another site can't apply on a user's behalf
router.route("/apply/:id").post(isAuthenticated, isStudent, applyForJob);

router.route("/my-applications").get(isAuthenticated, isStudent, getApplications);

router
  .route("/:id/applicants")
  .get(isAuthenticated, isRecruiter, getApplicationsForJob);
router
  .route("/status/:id/update")
  .put(isAuthenticated, isRecruiter, updateApplicationStatus);

export default router;
