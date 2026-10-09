import rateLimit from "express-rate-limit";

// Origins allowed to call the API with cookies (comma-separated FRONTEND_URL).
export const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Remove keys starting with "$" or containing "." from request bodies, so values
// like {"email": {"$ne": null}} can't turn into MongoDB query operators.
const stripOperators = (value) => {
  if (Array.isArray(value)) return value.map(stripOperators);
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete value[key];
      } else {
        value[key] = stripOperators(value[key]);
      }
    }
  }
  return value;
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) stripOperators(req.body);
  if (req.params) stripOperators(req.params);
  next();
};

// CSRF protection: browsers always send an Origin header on cross-site POST/PUT/DELETE.
// Reject state-changing requests that come from a site we don't trust.
export const verifyOrigin = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (origin && !allowedOrigins.includes(origin.replace(/\/$/, ""))) {
    return res
      .status(403)
      .json({ message: "Request blocked: untrusted origin", success: false });
  }
  next();
};

const limiterOptions = (max, message, windowMs = 15 * 60 * 1000) => ({
  windowMs,
  limit: max,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message, success: false },
});

// Login/register: slows down password guessing and account spam.
// AUTH_RATE_LIMIT can raise it for local test runs (default 20 per 15 minutes per IP).
export const authLimiter = rateLimit(
  limiterOptions(
    Number(process.env.AUTH_RATE_LIMIT) || 20,
    "Too many attempts, please try again in 15 minutes",
  ),
);

// Everything else: generous, just stops abusive clients.
export const apiLimiter = rateLimit(
  limiterOptions(600, "Too many requests, please slow down"),
);
