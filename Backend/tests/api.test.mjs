// End-to-end API tests for HireNest.
//
// Run against a running backend:   npm test
// (start the server first with:    AUTH_RATE_LIMIT=500 npm run dev)
//
// The tests create throwaway accounts with emails ending in "@hirenest.test" and delete
// everything they created at the end. They never upload files to Cloudinary: upload tests
// only check that bad files are rejected before any upload happens.
import "dotenv/config";
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

const API = `${process.env.API_URL || "http://localhost:8000"}/api/v1`;
const RUN = Date.now();
const PASSWORD = "test-password-123";
const email = (name) => `${name}-${RUN}@hirenest.test`;

// small fetch helper: returns { status, body, headers, cookie }
const call = async (method, path, { json, form, cookie, headers = {} } = {}) => {
  const init = { method, headers: { ...headers } };
  if (cookie) init.headers.cookie = cookie;
  if (json !== undefined) {
    init.headers["content-type"] = "application/json";
    init.body = typeof json === "string" ? json : JSON.stringify(json);
  }
  if (form) {
    init.body = new FormData();
    for (const [key, value] of Object.entries(form)) init.body.append(key, value);
  }
  const res = await fetch(API + path, { ...init, signal: AbortSignal.timeout(20000) });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  const setCookie = res.headers.get("set-cookie") || "";
  return { status: res.status, body, headers: res.headers, setCookie, cookie: setCookie.split(";")[0] };
};

const register = (name, role, extra = {}) =>
  call("POST", "/user/register", {
    form: { fullName: `Test ${name}`, email: email(name), phoneNumber: "9876543210", password: PASSWORD, role, ...extra },
  });
const login = (name, role) =>
  call("POST", "/user/login", { json: { email: email(name), password: PASSWORD, role } });

const ctx = {}; // cookies + ids shared between tests

before(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const health = await call("GET", "/health");
  assert.equal(health.status, 200, "backend must be running (npm run dev)");
});

after(async () => {
  // delete everything created by this run
  const users = await User.find({ email: new RegExp(`-${RUN}@hirenest\\.test$`) }).select("_id");
  const userIds = users.map((u) => u._id);
  const jobIds = await Job.find({ created_by: { $in: userIds } }).distinct("_id");
  await Application.deleteMany({ $or: [{ applicant: { $in: userIds } }, { job: { $in: jobIds } }] });
  await Job.deleteMany({ _id: { $in: jobIds } });
  await Company.deleteMany({ userId: { $in: userIds } });
  await User.deleteMany({ _id: { $in: userIds } });
  await mongoose.disconnect();
});

describe("auth", () => {
  test("register validates input", async () => {
    const cases = [
      [{ email: "not-an-email" }, /valid email/],
      [{ password: "short" }, /at least 8/],
      [{ phoneNumber: "123" }, /10-15 digits/],
      [{ role: "admin" }, /Student or Recruiter/],
      [{ fullName: "x" }, /2-60/],
    ];
    for (const [override, message] of cases) {
      const res = await register("invalid", "student", override);
      assert.equal(res.status, 400);
      assert.match(res.body.message, message);
    }
  });

  test("register student, two recruiters (no photo needed)", async () => {
    for (const [name, role] of [["stu", "student"], ["reca", "recruiter"], ["recb", "recruiter"]]) {
      const res = await register(name, role);
      assert.equal(res.status, 201, res.body.message);
    }
  });

  test("duplicate email is rejected, case-insensitively", async () => {
    const res = await register("stu", "student", { email: email("STU").toUpperCase() });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /already exists/);
  });

  test("login failures all give the same message (no account enumeration)", async () => {
    const attempts = [
      { email: email("nobody"), password: PASSWORD, role: "student" },
      { email: email("stu"), password: "wrong-password", role: "student" },
      { email: email("stu"), password: PASSWORD, role: "recruiter" },
    ];
    for (const json of attempts) {
      const res = await call("POST", "/user/login", { json });
      assert.equal(res.status, 400);
      assert.equal(res.body.message, "Incorrect email, password or role");
    }
  });

  test("NoSQL injection in login is neutralised", async () => {
    const res = await call("POST", "/user/login", {
      json: { email: { $ne: null }, password: { $ne: null }, role: "student" },
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.message, "All fields are required");
  });

  test("login sets an HttpOnly cookie and never returns the password", async () => {
    const res = await login("stu", "student");
    assert.equal(res.status, 200);
    assert.match(res.setCookie, /HttpOnly/i);
    assert.match(res.setCookie, /SameSite=(Lax|None)/i);
    assert.equal(res.body.user.password, undefined);
    assert.deepEqual(res.body.user.savedJobs, []);
    ctx.student = res.cookie;
    ctx.studentId = res.body.user._id;
    ctx.recA = (await login("reca", "recruiter")).cookie;
    ctx.recB = (await login("recb", "recruiter")).cookie;
  });

  test("protected routes need a valid session", async () => {
    assert.equal((await call("GET", "/user/saved-jobs")).status, 401);
    const bad = await call("GET", "/user/saved-jobs", { cookie: "token=garbage" });
    assert.equal(bad.status, 401);
  });
});

describe("security", () => {
  test("security headers are set and Express is hidden", async () => {
    const res = await call("GET", "/health");
    assert.equal(res.headers.get("x-powered-by"), null);
    assert.ok(res.headers.get("content-security-policy"));
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.ok(res.headers.get("ratelimit-policy"));
  });

  test("state-changing requests from other sites are blocked (CSRF)", async () => {
    const evil = await call("POST", "/user/logout", { headers: { origin: "https://evil.example" } });
    assert.equal(evil.status, 403);
    const ok = await call("POST", "/user/logout", { headers: { origin: "http://localhost:5173" } });
    assert.equal(ok.status, 200);
  });

  test("state changes can't be triggered with GET links", async () => {
    assert.equal((await call("GET", "/user/logout")).status, 404);
    assert.equal((await call("GET", "/application/apply/abc", { cookie: ctx.student })).status, 404);
  });

  test("bad input gets clean JSON errors", async () => {
    const badJson = await call("POST", "/user/login", { json: "{bad" });
    assert.equal(badJson.status, 400);
    assert.equal(badJson.body.message, "Invalid JSON body");
    const unknown = await call("GET", "/does-not-exist");
    assert.equal(unknown.status, 404);
    assert.equal(unknown.body.message, "Route not found");
    const big = await call("POST", "/user/login", { json: { email: "a".repeat(200_000) } });
    assert.equal(big.status, 413);
  });
});

describe("companies", () => {
  test("recruiter starts with an empty list (200, not 404)", async () => {
    const res = await call("GET", "/company/getCompanies", { cookie: ctx.recA });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.companies, []);
  });

  test("students cannot manage companies", async () => {
    const res = await call("POST", "/company/registerCompany", { cookie: ctx.student, json: { companyName: "x" } });
    assert.equal(res.status, 403);
  });

  test("create, duplicate name, read own", async () => {
    let res = await call("POST", "/company/registerCompany", { cookie: ctx.recA, json: { companyName: `Test Co A ${RUN}` } });
    assert.equal(res.status, 201);
    ctx.companyA = res.body.company._id;
    res = await call("POST", "/company/registerCompany", { cookie: ctx.recA, json: { companyName: `Test Co A ${RUN}` } });
    assert.equal(res.status, 400);
    res = await call("POST", "/company/registerCompany", { cookie: ctx.recB, json: { companyName: `Test Co B ${RUN}` } });
    ctx.companyB = res.body.company._id;
    res = await call("GET", `/company/getCompany/${ctx.companyA}`, { cookie: ctx.recA });
    assert.equal(res.status, 200);
  });

  test("other recruiters can't read or update someone else's company", async () => {
    assert.equal((await call("GET", `/company/getCompany/${ctx.companyA}`, { cookie: ctx.recB })).status, 404);
    const res = await call("PUT", `/company/updateCompany/${ctx.companyA}`, {
      cookie: ctx.recB,
      form: { name: "Hijacked" },
    });
    assert.equal(res.status, 404);
    assert.equal((await call("GET", "/company/getCompany/not-an-id", { cookie: ctx.recA })).status, 404);
  });

  test("update validates the website (no javascript: links)", async () => {
    const res = await call("PUT", `/company/updateCompany/${ctx.companyA}`, {
      cookie: ctx.recA,
      form: { name: `Test Co A ${RUN}`, website: "javascript:alert(1)" },
    });
    assert.equal(res.status, 400);
  });

  test("update works", async () => {
    const res = await call("PUT", `/company/updateCompany/${ctx.companyA}`, {
      cookie: ctx.recA,
      form: { name: `Test Co A ${RUN}`, description: "We test things", website: "https://example.com", location: "Pune" },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.company.website, "https://example.com");
  });

  test("logo upload rejects non-images before uploading", async () => {
    const form = new FormData();
    form.append("name", `Test Co A ${RUN}`);
    form.append("file", new Blob(["not an image"], { type: "text/plain" }), "logo.txt");
    const res = await fetch(`${API}/company/updateCompany/${ctx.companyA}`, {
      method: "PUT",
      headers: { cookie: ctx.recA },
      body: form,
    });
    assert.equal(res.status, 400);
    assert.match((await res.json()).message, /JPG, PNG/);
  });
});

describe("jobs", () => {
  const jobBody = () => ({
    title: `Test C++ Engineer ${RUN}`,
    description: "Write fast code",
    requirements: "C++,  Linux , Git",
    salary: "12.5",
    location: "Pune",
    jobType: "Full Time",
    experience: 0,
    position: "2",
    companyId: ctx.companyA,
  });

  test("create validates fields and ownership", async () => {
    const bad = [
      [{ title: "" }, 400],
      [{ salary: "abc" }, 400],
      [{ position: "0" }, 400],
      [{ companyId: "junk" }, 400],
      [{ companyId: ctx.companyB }, 403],
    ];
    for (const [override, status] of bad) {
      const res = await call("POST", "/job/createJob", { cookie: ctx.recA, json: { ...jobBody(), ...override } });
      assert.equal(res.status, status, JSON.stringify(override));
    }
    assert.equal((await call("POST", "/job/createJob", { cookie: ctx.student, json: jobBody() })).status, 403);
  });

  test("recruiter posts jobs (0 years experience allowed)", async () => {
    let res = await call("POST", "/job/createJob", { cookie: ctx.recA, json: jobBody() });
    assert.equal(res.status, 201);
    assert.deepEqual(res.body.job.requirements, ["C++", "Linux", "Git"]);
    assert.equal(res.body.job.experienceLevel, 0);
    ctx.jobId = res.body.job._id;
    res = await call("POST", "/job/createJob", { cookie: ctx.recA, json: { ...jobBody(), title: `Test Frontend Developer ${RUN}` } });
    ctx.job2 = res.body.job._id;
  });

  test("visitors can browse jobs without logging in", async () => {
    const res = await call("GET", "/job/getAllJobs");
    assert.equal(res.status, 200);
    const job = res.body.jobs.find((j) => j._id === ctx.jobId);
    assert.ok(job, "new job should be listed");
    assert.equal(job.applications, undefined, "list must not include applications");
    assert.equal(job.company.name, `Test Co A ${RUN}`);
  });

  test("search: special characters, word-by-word, long input", async () => {
    let res = await call("GET", `/job/getAllJobs?keyword=${encodeURIComponent("c++")}`);
    assert.ok(res.body.jobs.some((j) => j._id === ctx.jobId));
    res = await call("GET", `/job/getAllJobs?keyword=${encodeURIComponent(`Front End ${RUN}`)}`);
    assert.ok(res.body.jobs.some((j) => j._id === ctx.job2), "Front End should match Frontend");
    res = await call("GET", `/job/getAllJobs?keyword=${"a".repeat(5000)}`);
    assert.equal(res.status, 200);
  });

  test("job details are public and include company + applicant count", async () => {
    const res = await call("GET", `/job/getJobById/${ctx.jobId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.job.company.website, "https://example.com");
    assert.equal(res.body.job.applicantCount, 0);
    assert.equal(res.body.job.hasApplied, false);
    assert.equal(res.body.job.applications, undefined);
    assert.equal((await call("GET", "/job/getJobById/abc")).status, 404);
  });

  test("only the owner can edit; edits are validated", async () => {
    let res = await call("PUT", `/job/updateJob/${ctx.jobId}`, { cookie: ctx.recA, json: { ...jobBody(), salary: "15" } });
    assert.equal(res.status, 200);
    assert.equal(res.body.job.salary, 15);
    res = await call("PUT", `/job/updateJob/${ctx.jobId}`, { cookie: ctx.recB, json: { ...jobBody(), companyId: ctx.companyB } });
    assert.equal(res.status, 404);
    res = await call("PUT", `/job/updateJob/${ctx.jobId}`, { cookie: ctx.recA, json: { ...jobBody(), companyId: ctx.companyB } });
    assert.equal(res.status, 403);
  });

  test("admin job list is recruiter-only", async () => {
    const res = await call("GET", "/job/getAdminJobs", { cookie: ctx.recA });
    assert.equal(res.status, 200);
    assert.equal(res.body.jobs.length, 2);
    assert.equal((await call("GET", "/job/getAdminJobs", { cookie: ctx.student })).status, 403);
  });
});

describe("applications", () => {
  test("visitors and recruiters can't apply", async () => {
    assert.equal((await call("POST", `/application/apply/${ctx.jobId}`)).status, 401);
    assert.equal((await call("POST", `/application/apply/${ctx.jobId}`, { cookie: ctx.recA })).status, 403);
  });

  test("student applies once; duplicates are rejected", async () => {
    let res = await call("POST", `/application/apply/${ctx.jobId}`, { cookie: ctx.student });
    assert.equal(res.status, 201);
    ctx.applicationId = res.body.application._id;
    res = await call("POST", `/application/apply/${ctx.jobId}`, { cookie: ctx.student });
    assert.equal(res.status, 400);
  });

  test("double-click race creates only one application", async () => {
    const [a, b] = await Promise.all([
      call("POST", `/application/apply/${ctx.job2}`, { cookie: ctx.student }),
      call("POST", `/application/apply/${ctx.job2}`, { cookie: ctx.student }),
    ]);
    assert.deepEqual([a.status, b.status].sort(), [201, 400]);
    assert.equal(await Application.countDocuments({ job: ctx.job2 }), 1);
  });

  test("job page shows hasApplied for the student", async () => {
    const res = await call("GET", `/job/getJobById/${ctx.jobId}`, { cookie: ctx.student });
    assert.equal(res.body.job.hasApplied, true);
    assert.equal(res.body.job.applicantCount, 1);
  });

  test("student sees their applications with job + company", async () => {
    const res = await call("GET", "/application/my-applications", { cookie: ctx.student });
    assert.equal(res.status, 200);
    assert.equal(res.body.applications.length, 2);
    assert.equal(res.body.applications[0].job.company.name, `Test Co A ${RUN}`);
  });

  test("only the job owner sees applicants, without private fields", async () => {
    const res = await call("GET", `/application/${ctx.jobId}/applicants`, { cookie: ctx.recA });
    assert.equal(res.status, 200);
    const applicant = res.body.job.applications[0].applicant;
    assert.equal(applicant.email, email("stu"));
    assert.equal(applicant.password, undefined);
    assert.equal(applicant.savedJobs, undefined);
    assert.equal((await call("GET", `/application/${ctx.jobId}/applicants`, { cookie: ctx.recB })).status, 404);
    assert.equal((await call("GET", `/application/${ctx.jobId}/applicants`, { cookie: ctx.student })).status, 403);
  });

  test("status updates: owner only, valid values only", async () => {
    const path = `/application/status/${ctx.applicationId}/update`;
    assert.equal((await call("PUT", path, { cookie: ctx.recA, json: { status: "hired" } })).status, 400);
    assert.equal((await call("PUT", path, { cookie: ctx.recB, json: { status: "accepted" } })).status, 403);
    assert.equal((await call("PUT", path, { cookie: ctx.student, json: { status: "accepted" } })).status, 403);
    const res = await call("PUT", path, { cookie: ctx.recA, json: { status: "Accepted" } });
    assert.equal(res.status, 200);
    assert.equal(res.body.application.status, "accepted");
  });
});

describe("saved jobs", () => {
  test("save, no duplicates, list, unsave", async () => {
    let res = await call("PUT", `/user/saved-jobs/${ctx.jobId}`, { cookie: ctx.student });
    assert.equal(res.status, 200);
    res = await call("PUT", `/user/saved-jobs/${ctx.jobId}`, { cookie: ctx.student });
    assert.equal(res.body.savedJobs.length, 1);
    res = await call("GET", "/user/saved-jobs", { cookie: ctx.student });
    assert.equal(res.body.savedJobs[0].company.name, `Test Co A ${RUN}`);
    res = await call("DELETE", `/user/saved-jobs/${ctx.jobId}`, { cookie: ctx.student });
    assert.equal(res.body.savedJobs.length, 0);
  });

  test("invalid ids and recruiters are rejected", async () => {
    assert.equal((await call("PUT", "/user/saved-jobs/not-an-id", { cookie: ctx.student })).status, 404);
    assert.equal((await call("PUT", `/user/saved-jobs/${new mongoose.Types.ObjectId()}`, { cookie: ctx.student })).status, 404);
    assert.equal((await call("PUT", `/user/saved-jobs/${ctx.jobId}`, { cookie: ctx.recA })).status, 403);
  });

  test("saved jobs come back on the next login", async () => {
    await call("PUT", `/user/saved-jobs/${ctx.jobId}`, { cookie: ctx.student });
    const res = await login("stu", "student");
    assert.ok(res.body.user.savedJobs.map(String).includes(ctx.jobId));
  });
});

describe("profile", () => {
  test("validates email, uniqueness and bio length", async () => {
    const cases = [
      [{ email: "nope" }, /valid email/],
      [{ email: email("reca") }, /already used/],
      [{ bio: "x".repeat(301) }, /300/],
      [{ phoneNumber: "12" }, /10-15/],
    ];
    for (const [form, message] of cases) {
      const res = await call("POST", "/user/profile/update", { cookie: ctx.student, form });
      assert.equal(res.status, 400);
      assert.match(res.body.message, message);
    }
  });

  test("updates fields and trims skills", async () => {
    const res = await call("POST", "/user/profile/update", {
      cookie: ctx.student,
      form: { bio: "Hello there", skills: "React,  Node , ,Mongo" },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.user.profile.skills, ["React", "Node", "Mongo"]);
    assert.equal(res.body.user.password, undefined);
  });

  test("resume must be a PDF and photos are size-limited (rejected before upload)", async () => {
    const wrongType = new FormData();
    wrongType.append("file", new Blob(["hello"], { type: "text/plain" }), "resume.txt");
    let res = await fetch(`${API}/user/profile/update`, { method: "POST", headers: { cookie: ctx.student }, body: wrongType });
    assert.equal(res.status, 400);
    assert.match((await res.json()).message, /PDF/);

    const tooBig = new FormData();
    tooBig.append("profilePhoto", new Blob([new Uint8Array(6 * 1024 * 1024)], { type: "image/png" }), "big.png");
    res = await fetch(`${API}/user/profile/update`, { method: "POST", headers: { cookie: ctx.student }, body: tooBig });
    assert.equal(res.status, 400);
    assert.match((await res.json()).message, /too large/);
  });
});

describe("deleting a job", () => {
  test("only the owner can delete; applications and bookmarks are cleaned up", async () => {
    assert.equal((await call("DELETE", `/job/deleteJob/${ctx.jobId}`, { cookie: ctx.recB })).status, 404);
    assert.equal((await call("DELETE", `/job/deleteJob/${ctx.jobId}`, { cookie: ctx.student })).status, 403);
    const res = await call("DELETE", `/job/deleteJob/${ctx.jobId}`, { cookie: ctx.recA });
    assert.equal(res.status, 200);
    assert.equal(await Application.countDocuments({ job: ctx.jobId }), 0);
    const saved = await call("GET", "/user/saved-jobs", { cookie: ctx.student });
    assert.equal(saved.body.savedJobs.length, 0);
    assert.equal((await call("GET", `/job/getJobById/${ctx.jobId}`)).status, 404);
  });
});
