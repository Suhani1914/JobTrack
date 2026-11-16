
import { Request, Response } from "express";
import mongoose from "mongoose";
import Job from "../models/Job";

// Get jobs belonging to the logged-in user
export const getJobs = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const jobs = await Job.find({ user: userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch jobs.",
    });
  }
};

// Create a job for the logged-in user
export const createJob = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const {
      company,
      role,
      location,
      status,
      appliedDate,
      jobType,
      jobUrl,
      notes,
    } = req.body;

    if (
      typeof company !== "string" ||
      !company.trim() ||
      typeof role !== "string" ||
      !role.trim() ||
      typeof location !== "string" ||
      !location.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Company, role and location are required.",
      });
    }

    const newJob = await Job.create({
      company: company.trim(),
      role: role.trim(),
      location: location.trim(),
      status,
      appliedDate,
      jobType,
      jobUrl,
      notes,
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully.",
      data: newJob,
    });
  } catch (error) {
    console.error("Create job error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create job.",
    });
  }
};

// Update a job belonging to the logged-in user
export const updateJob = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID.",
      });
    }

    const {
      company,
      role,
      location,
      status,
      appliedDate,
      jobType,
      jobUrl,
      notes,
    } = req.body;

    const updateData: Record<string, unknown> = {};

    if (company !== undefined) updateData.company = company;
    if (role !== undefined) updateData.role = role;
    if (location !== undefined) updateData.location = location;
    if (status !== undefined) updateData.status = status;
    if (appliedDate !== undefined) updateData.appliedDate = appliedDate;
    if (jobType !== undefined) updateData.jobType = jobType;
    if (jobUrl !== undefined) updateData.jobUrl = jobUrl;
    if (notes !== undefined) updateData.notes = notes;

    const updatedJob = await Job.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      data: updatedJob,
    });
  } catch (error) {
    console.error("Update job error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update job.",
    });
  }
};

// Delete a job belonging to the logged-in user
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID.",
      });
    }

    const deletedJob = await Job.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
    });
  } catch (error) {
    console.error("Delete job error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete job.",
    });
  }
};
