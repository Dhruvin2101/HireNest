// Filter options + matching rules for the Jobs page sidebar.

// Role filters match the job title loosely, so "Frontend", "Front End" and
// "Front-End" Developer all count as the same role.
export const ROLE_FILTERS = [
  { label: "Frontend Developer", pattern: /front\s*-?\s*end/i },
  { label: "Backend Developer", pattern: /back\s*-?\s*end/i },
  { label: "Full Stack Developer", pattern: /full\s*-?\s*stack/i },
  { label: "Mobile Developer", pattern: /mobile|android|ios|flutter|react native/i },
  { label: "Data / ML", pattern: /data|machine learning|\bml\b|\bai\b/i },
  { label: "DevOps / Cloud", pattern: /devops|cloud|\bsre\b/i },
];

// Salary is stored in LPA (lakhs per annum). max is exclusive.
export const SALARY_FILTERS = [
  { label: "0 - 5 LPA", min: 0, max: 5 },
  { label: "5 - 10 LPA", min: 5, max: 10 },
  { label: "10 - 20 LPA", min: 10, max: 20 },
  { label: "20+ LPA", min: 20, max: Infinity },
];

const normalise = (text) => String(text || "").trim().toLowerCase();

// Build location options from the jobs we actually have, most common first,
// so every option returns at least one job.
export const getLocationOptions = (jobs, limit = 8) => {
  const counts = new Map();
  for (const job of jobs) {
    const key = normalise(job?.location);
    if (!key) continue;
    const entry = counts.get(key) || { label: job.location.trim(), count: 0 };
    entry.count += 1;
    counts.set(key, entry);
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit)
    .map((entry) => entry.label);
};

// filters = { location, role, salary } where each is a label or "" (no filter)
export const applyJobFilters = (jobs, filters) => {
  const role = ROLE_FILTERS.find((item) => item.label === filters.role);
  const salary = SALARY_FILTERS.find((item) => item.label === filters.salary);

  return jobs.filter((job) => {
    if (filters.location && normalise(job?.location) !== normalise(filters.location)) {
      return false;
    }
    if (role && !role.pattern.test(job?.title || "")) {
      return false;
    }
    if (salary) {
      const value = Number(job?.salary);
      if (Number.isNaN(value) || value < salary.min || value >= salary.max) {
        return false;
      }
    }
    return true;
  });
};
