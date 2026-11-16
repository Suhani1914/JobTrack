
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  Settings,
  Plus,
  Search,
  MapPin,
  CalendarDays,
  Pencil,
  Trash2,
  ExternalLink,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

import type { Job } from "./types/job";

import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
} from "./services/jobService";

import type { NewJob } from "./services/jobService";

import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import "./App.css";

function App() {
  const { user, logoutUser, loading: authLoading } = useAuth();
  const [authPage, setAuthPage] = useState<"login" | "signup">("login");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [formData, setFormData] = useState<NewJob>({
    company: "",
    role: "",
    location: "",
    status: "Applied",
    appliedDate: new Date().toISOString().split("T")[0],
    jobType: "Full-time",
    jobUrl: "",
    notes: "",
  });

  // Fetch jobs only after the user logs in.
  useEffect(() => {
    let isActive = true;

    if (!user) {
      setJobs([]);
      setLoading(false);
      setError("");
      setSelectedJob(null);
      setShowForm(false);
      setEditingJobId(null);

      return () => {
        isActive = false;
      };
    }

    const fetchJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getJobs();

        if (isActive) {
          setJobs(data);
        }
      } catch {
        if (isActive) {
          setError(
            "Unable to load applications. Please check your backend or login again."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      isActive = false;
    };
  }, [user]);

  // Reset form
  const resetForm = () => {
    setFormData({
      company: "",
      role: "",
      location: "",
      status: "Applied",
      appliedDate: new Date().toISOString().split("T")[0],
      jobType: "Full-time",
      jobUrl: "",
      notes: "",
    });

    setEditingJobId(null);
    setShowForm(false);
  };

  // Add or update application
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      if (editingJobId) {
        const updatedJob = await updateJob(editingJobId, formData);

        setJobs((previousJobs) =>
          previousJobs.map((job) =>
            job._id === editingJobId ? updatedJob : job
          )
        );

        if (selectedJob?._id === editingJobId) {
          setSelectedJob(updatedJob);
        }
      } else {
        const newJob = await createJob(formData);

        setJobs((previousJobs) => [newJob, ...previousJobs]);
        setCurrentPage(1);
      }

      resetForm();
    } catch {
      setError(
        editingJobId
          ? "Unable to update application."
          : "Unable to add application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Edit application
  const handleEdit = (job: Job) => {
    setEditingJobId(job._id);

    setFormData({
      company: job.company,
      role: job.role,
      location: job.location,
      status: job.status,
      appliedDate: job.appliedDate.slice(0, 10),
      jobType: job.jobType,
      jobUrl: job.jobUrl || "",
      notes: job.notes || "",
    });

    setShowForm(true);
    setError("");
    setSelectedJob(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete application
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      setError("");
      await deleteJob(id);

      setJobs((previousJobs) =>
        previousJobs.filter((job) => job._id !== id)
      );

      if (selectedJob?._id === id) {
        setSelectedJob(null);
      }

      if (editingJobId === id) {
        resetForm();
      }
    } catch {
      setError("Unable to delete application.");
    }
  };

  // Statistics
  const totalJobs = jobs.length;

  const appliedJobs = jobs.filter(
    (job) => job.status === "Applied"
  ).length;

  const interviewJobs = jobs.filter(
    (job) => job.status === "Interview"
  ).length;

  const selectedJobs = jobs.filter(
    (job) => job.status === "Selected"
  ).length;

  const rejectedJobs = jobs.filter(
    (job) => job.status === "Rejected"
  ).length;

  const getPercentage = (value: number) =>
    totalJobs === 0 ? 0 : Math.round((value / totalJobs) * 100);

  // Search and filter
  const filteredJobs = jobs.filter((job) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      job.company.toLowerCase().includes(search) ||
      job.role.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort applications by applied date
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = new Date(a.appliedDate).getTime();
    const dateB = new Date(b.appliedDate).getTime();

    return sortOrder === "newest"
      ? dateB - dateA
      : dateA - dateB;
  });

  // Pagination
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage);

  const startIndex = (currentPage - 1) * jobsPerPage;

  const paginatedJobs = sortedJobs.slice(
    startIndex,
    startIndex + jobsPerPage
  );

  // Keep current page valid after deleting or filtering jobs
  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    } else if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Reset page when search, filter or sorting changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  // Show authentication screen when the user is not logged in.
  if (authLoading) {
    return <div className="empty-state">Loading JobTrack...</div>;
  }

  if (!user) {
    return authPage === "login" ? (
      <Login onSwitchToSignup={() => setAuthPage("signup")} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthPage("login")} />
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            <BriefcaseBusiness size={22} />
          </div>
          <span>JobTrack</span>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </div>

          <div className="nav-item">
            <BriefcaseBusiness size={19} />
            <span>My Applications</span>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </div>

          <div className="sidebar-profile">
            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <button
            type="button"
            className="nav-item logout-button"
            onClick={logoutUser}
            style={{
              width: "100%",
              border: 0,
              background: "transparent",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>Dashboard</h1>
            <p className="subtitle">
              Track your job search journey in one place.
            </p>
          </div>

          <button
            className="header-add-button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus size={18} />
            Add Application
          </button>
        </header>

        {/* Statistics */}
        <section className="stats-container">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total Applications</span>
              <div className="stat-icon blue">
                <BriefcaseBusiness size={20} />
              </div>
            </div>
            <h2>{totalJobs}</h2>
            <p>All tracked applications</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Applied</span>
              <div className="stat-icon purple">
                <Clock size={20} />
              </div>
            </div>
            <h2>{appliedJobs}</h2>
            <p>Waiting for response</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Interviews</span>
              <div className="stat-icon orange">
                <Users size={20} />
              </div>
            </div>
            <h2>{interviewJobs}</h2>
            <p>Interview opportunities</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Selected</span>
              <div className="stat-icon green">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <h2>{selectedJobs}</h2>
            <p>Successful applications</p>
          </div>
        </section>

        {/* Insights */}
        <section className="insights-card">
          <div className="insights-heading">
            <div>
              <h2>Application Overview</h2>
              <p>Distribution of your application statuses</p>
            </div>
            <Building2 size={22} />
          </div>

          <div className="insights-list">
            <div className="insight-row">
              <div className="insight-label">
                <span className="dot applied-dot"></span>
                Applied
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill applied-fill"
                  style={{ width: `${getPercentage(appliedJobs)}%` }}
                ></div>
              </div>
              <strong>{getPercentage(appliedJobs)}%</strong>
            </div>

            <div className="insight-row">
              <div className="insight-label">
                <span className="dot interview-dot"></span>
                Interview
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill interview-fill"
                  style={{ width: `${getPercentage(interviewJobs)}%` }}
                ></div>
              </div>
              <strong>{getPercentage(interviewJobs)}%</strong>
            </div>

            <div className="insight-row">
              <div className="insight-label">
                <span className="dot selected-dot"></span>
                Selected
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill selected-fill"
                  style={{ width: `${getPercentage(selectedJobs)}%` }}
                ></div>
              </div>
              <strong>{getPercentage(selectedJobs)}%</strong>
            </div>

            <div className="insight-row">
              <div className="insight-label">
                <span className="dot rejected-dot"></span>
                Rejected
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill rejected-fill"
                  style={{ width: `${getPercentage(rejectedJobs)}%` }}
                ></div>
              </div>
              <strong>{getPercentage(rejectedJobs)}%</strong>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="applications-section">
          <div className="section-heading">
            <div>
              <h2>My Applications</h2>
              <p>Manage and monitor your job applications.</p>
            </div>

            <span>{filteredJobs.length} results</span>
          </div>

          {/* Search, Filter and Sort */}
          <div className="search-filter-container">
            <div className="search-box">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search company or job role..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              className="filter-select"
              value={sortOrder}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <form className="job-form" onSubmit={handleSubmit}>
              <div className="form-heading">
                <div>
                  <h2>
                    {editingJobId ? "Edit Application" : "Add New Application"}
                  </h2>
                  <p>Enter the details of your job application.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Google"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Job Role *</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Developer"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Application Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as NewJob["status"],
                      })
                    }
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) =>
                      setFormData({ ...formData, jobType: e.target.value })
                    }
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Applied Date</label>
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appliedDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Job URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/job"
                    value={formData.jobUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, jobUrl: e.target.value })
                    }
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Add notes about this application..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingJobId
                    ? "Update Application"
                    : "Save Application"}
                </button>
              </div>
            </form>
          )}

          {error && <p className="error-message">{error}</p>}

          {loading && (
            <p className="empty-state">Loading applications...</p>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="empty-state">
              <BriefcaseBusiness size={35} />
              <h3>No applications yet</h3>
              <p>Add your first job application to get started.</p>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && filteredJobs.length === 0 && (
            <div className="empty-state">
              <Search size={30} />
              <h3>No matching applications</h3>
              <p>Try changing your search or filter.</p>
            </div>
          )}

          {/* Job Cards */}
          {!loading && !error && paginatedJobs.length > 0 && (
            <>
              <div className="job-list">
                {paginatedJobs.map((job) => (
                  <div className="job-card" key={job._id}>
                    <div className="company-avatar">
                      <Building2 size={23} />
                    </div>

                    <div className="job-info">
                      <h3>{job.role}</h3>
                      <p className="company-name">{job.company}</p>

                      <div className="job-meta">
                        <span>
                          <MapPin size={14} />
                          {job.location}
                        </span>

                        <span>
                          <CalendarDays size={14} />
                          {job.appliedDate.slice(0, 10)}
                        </span>

                        <span>{job.jobType}</span>
                      </div>

                      {job.jobUrl && (
                        <a
                          className="job-link"
                          href={job.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Job Posting <ExternalLink size={13} />
                        </a>
                      )}
                    </div>

                    <div className="job-actions">
                      <span className={`status ${job.status.toLowerCase()}`}>
                        {job.status}
                      </span>

                      <button
                        type="button"
                        className="icon-button"
                        title="View details"
                        onClick={() => setSelectedJob(job)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        className="icon-button edit-button"
                        title="Edit application"
                        onClick={() => handleEdit(job)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="icon-button delete-button"
                        title="Delete application"
                        onClick={() => handleDelete(job._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination-container">
                <p>
                  Showing {startIndex + 1}–
                  {Math.min(startIndex + jobsPerPage, sortedJobs.length)}
                  {" "}of {sortedJobs.length} applications
                </p>

                <div className="pagination-buttons">
                  <button
                    type="button"
                    className="pagination-button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => page - 1)}
                  >
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <span className="page-number">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="pagination-button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => page + 1)}
                  >
                    Next
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <footer className="dashboard-footer">
          JobTrack © {new Date().getFullYear()} · Track your career journey.
        </footer>
      </main>

      {/* Job Details Modal */}
      {selectedJob && (
        <div
          className="details-overlay"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="details-header">
              <div>
                <h2>Application Details</h2>
                <p>Complete information about this application.</p>
              </div>

              <button
                type="button"
                className="details-close-button"
                onClick={() => setSelectedJob(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="details-company">
              <div className="company-avatar">
                <Building2 size={25} />
              </div>

              <div>
                <h3>{selectedJob.role}</h3>
                <p>{selectedJob.company}</p>
              </div>
            </div>

            <div className="details-grid">
              <div className="details-item">
                <span>Location</span>
                <strong>{selectedJob.location}</strong>
              </div>

              <div className="details-item">
                <span>Job Type</span>
                <strong>{selectedJob.jobType}</strong>
              </div>

              <div className="details-item">
                <span>Application Date</span>
                <strong>{selectedJob.appliedDate.slice(0, 10)}</strong>
              </div>

              <div className="details-item">
                <span>Status</span>
                <strong>
                  <span className={`status ${selectedJob.status.toLowerCase()}`}>
                    {selectedJob.status}
                  </span>
                </strong>
              </div>
            </div>

            <div className="details-notes">
              <h4>Notes</h4>
              <p>
                {selectedJob.notes?.trim() ||
                  "No notes added for this application."}
              </p>
            </div>

            {selectedJob.jobUrl && (
              <a
                className="details-job-link"
                href={selectedJob.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Job Posting <ExternalLink size={15} />
              </a>
            )}

            <div className="details-footer">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="submit-button"
                onClick={() => handleEdit(selectedJob)}
              >
                <Pencil size={15} />
                Edit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
