# HireNest – Job Portal

A full-stack job portal where **students** find, save and apply for jobs, and **recruiters** register companies, post jobs and review applicants.

**Stack:** React 19, Vite, Redux Toolkit, Tailwind CSS, shadcn/ui · Node.js, Express 5, MongoDB (Mongoose), JWT, Cloudinary

## Features

**Students and visitors**
- Browse and search jobs without an account (word-by-word search across title, description, location, type and requirements)
- Filter by location, role and salary; browse by category
- Job details with company info, requirements and applicant count
- Sign up / log in, apply to jobs, track application status (pending / accepted / rejected)
- Save jobs for later (bookmarks sync across devices)
- Profile with bio, skills, profile photo and PDF resume

**Recruiters**
- Register and edit companies (logo, website, location, description)
- Post, edit and delete jobs (deleting cleans up applications and bookmarks)
- See applicants per job and accept or reject them

**Everywhere:** responsive layout (phone, tablet, desktop), custom 404 and error pages, automatic logout when a session expires.

## Security

- Passwords hashed with bcrypt; JWT in an HttpOnly, SameSite cookie (Secure in production)
- Role checks (student / recruiter) and ownership checks on every endpoint
- Rate limiting (login/register: 20 tries per 15 min per IP), Helmet security headers
- CSRF protection: state-changing requests must come from an allowed origin and use POST/PUT/DELETE
- NoSQL-injection protection, input validation, generic login errors (no account enumeration)
- Upload limits: images only (JPG/PNG/WEBP/GIF, 2 MB) and PDF resumes (5 MB)
- No password hashes or internal error details are ever sent to the browser

## Getting started

Requirements: **Node.js 20+**, a **MongoDB** database (e.g. a free MongoDB Atlas cluster) and a **Cloudinary** account.

### 1. Backend

```bash
cd Backend
npm install
cp .env.example .env    # then fill in the values (see comments in the file)
npm run dev             # http://localhost:8000
```

### 2. Frontend

```bash
cd Frontend
npm install
cp .env.example .env    # optional: only needed if the API is not on http://localhost:8000
npm run dev             # http://localhost:5173
```

## Scripts

| Where | Command | What it does |
|---|---|---|
| Backend | `npm run dev` | Start the API with auto-reload |
| Backend | `npm start` | Start the API (production) |
| Backend | `npm test` | Run the end-to-end API test suite (39 tests) against the running API |
| Frontend | `npm run dev` | Start the dev server |
| Frontend | `npm run build` | Production build into `dist/` |
| Frontend | `npm run lint` | ESLint |

**Running the tests:** start the API with a higher login limit so repeated runs aren't rate-limited, then run the suite in a second terminal:

```bash
AUTH_RATE_LIMIT=500 npm run dev   # terminal 1 (in Backend/)
npm test                          # terminal 2 (in Backend/)
```

The tests create throwaway users with `@hirenest.test` emails and delete everything they created when they finish. They never upload files to Cloudinary.

## Deploying

- **Backend** (Render, Railway, a VPS…): set the variables from `Backend/.env.example`, plus `NODE_ENV=production`, `FRONTEND_URL=https://your-frontend-domain` and `TRUST_PROXY=1` if behind a proxy. Start command: `npm start`. Health check: `GET /api/v1/health`.
- **Frontend** (Vercel, Netlify…): set `VITE_API_URL=https://your-api-domain`, build with `npm run build`, serve `dist/`. Configure the host to send all routes to `index.html` (single-page app).
- Both must be served over **HTTPS** in production (needed for secure cookies).

## API overview

All routes are under `/api/v1`. 🔒 = login required.

| Method | Route | Who |
|---|---|---|
| POST | `/user/register` · `/user/login` · `/user/logout` | anyone |
| POST | `/user/profile/update` | 🔒 any user |
| GET / PUT / DELETE | `/user/saved-jobs`, `/user/saved-jobs/:jobId` | 🔒 student |
| GET | `/job/getAllJobs?keyword=` · `/job/getJobById/:id` | anyone |
| POST / PUT / DELETE | `/job/createJob` · `/job/updateJob/:id` · `/job/deleteJob/:id` | 🔒 recruiter (owner) |
| GET | `/job/getAdminJobs` | 🔒 recruiter |
| POST | `/company/registerCompany` | 🔒 recruiter |
| GET / PUT | `/company/getCompanies` · `/company/getCompany/:id` · `/company/updateCompany/:id` | 🔒 recruiter (owner) |
| POST | `/application/apply/:jobId` | 🔒 student |
| GET | `/application/my-applications` | 🔒 student |
| GET | `/application/:jobId/applicants` | 🔒 recruiter (job owner) |
| PUT | `/application/status/:id/update` | 🔒 recruiter (job owner) |
| GET | `/health` | anyone |
