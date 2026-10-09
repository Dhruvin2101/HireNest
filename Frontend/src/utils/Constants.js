// Set VITE_API_URL in Frontend/.env for deployment (see .env.example)
const API_BASE = `${(import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "")}/api/v1`;

export const USER_API_END_POINT = `${API_BASE}/user`;
export const JOB_API_END_POINT = `${API_BASE}/job`;
export const APPLICATION_API_END_POINT = `${API_BASE}/application`;
export const COMPANY_API_END_POINT = `${API_BASE}/company`;

// Badge colours for application status (used by applicant + applied-job tables)
export const STATUS_BADGE_CLASS = {
  accepted: "bg-brand-600 text-white",
  pending: "bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-200",
  rejected: "bg-paper text-ink-muted ring-1 ring-inset ring-line",
};
