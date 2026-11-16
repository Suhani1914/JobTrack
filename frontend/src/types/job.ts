
export interface Job {
  _id: string;
  company: string;
  role: string;
  location: string;
  status: "Applied" | "Interview" | "Selected" | "Rejected";
  appliedDate: string;
  jobType: string;
  jobUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
