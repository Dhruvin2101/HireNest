import express from "express";
import {
  createJob,
  deleteJob,
  getAdminJobs,
  getAllJobs,
  getJobById,
  updateJob,
} from "../controllers/job.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import optionalAuth from "../middlewares/optionalAuth.js";

const router = express.Router();
const isRecruiter = authorizeRoles("recruiter");

router.route("/createJob").post(isAuthenticated, isRecruiter, createJob);
router.route("/getAdminJobs").get(isAuthenticated, isRecruiter, getAdminJobs);
// public: visitors can browse jobs without an account
router.route("/getAllJobs").get(optionalAuth, getAllJobs);
router.route("/getJobById/:id").get(optionalAuth, getJobById);
router.route("/updateJob/:id").put(isAuthenticated, isRecruiter, updateJob);
router.route("/deleteJob/:id").delete(isAuthenticated, isRecruiter, deleteJob);

export default router;
