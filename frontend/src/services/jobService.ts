
import type { Job } from "../types/job";

const API_URL = import.meta.env.VITE_API_URL;

// Job creation interface
export interface NewJob {
  company: string;
  role: string;
  location: string;
  status: "Applied" | "Interview" | "Selected" | "Rejected";
  appliedDate: string;
  jobType: string;
  jobUrl?: string;
  notes?: string;
}

// Get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Get all jobs
export const getJobs = async (): Promise<Job[]> => {
  const response = await fetch(`${API_URL}/jobs`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch jobs. Please login again.");
  }

  const result = await response.json();

  return result.data;
};

// Create a new job
export const createJob = async (job: NewJob): Promise<Job> => {
  const response = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(job),
  });

  if (!response.ok) {
    throw new Error("Failed to create job.");
  }

  const result = await response.json();

  return result.data;
};

// Update an existing job
export const updateJob = async (
  id: string,
  job: Partial<NewJob>
): Promise<Job> => {
  const response = await fetch(`${API_URL}/jobs/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(job),
  });

  if (!response.ok) {
    throw new Error("Failed to update job.");
  }

  const result = await response.json();

  return result.data;
};

// Delete a job
export const deleteJob = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/jobs/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete job.");
  }
};
