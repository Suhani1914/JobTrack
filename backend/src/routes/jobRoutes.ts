
import express from "express";

import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController";

import authenticateToken from "../middleware/authMiddleware";

const router = express.Router();

// All routes below require a valid JWT token
router.use(authenticateToken);

// Get all jobs belonging to the logged-in user
router.get("/", getJobs);

// Create a new job
router.post("/", createJob);

// Update a job
router.put("/:id", updateJob);

// Delete a job
router.delete("/:id", deleteJob);

export default router;
