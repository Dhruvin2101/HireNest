// API location:
// - VITE_API_URL set (Frontend/.env): use it, e.g. a separately hosted API.
// - Dev server (npm run dev): the local backend on http://localhost:8000.
// - Production build: same origin. On Vercel the "/api" rewrite sends these calls to the
//   backend service, so the browser just calls /api/v1/... on the site's own domain.
const API_ORIGIN =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");
const API_BASE = `${API_ORIGIN.replace(/\/$/, "")}/api/v1`;

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
