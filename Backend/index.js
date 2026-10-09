// must be first: other modules read process.env when they are imported
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import connectDB from "./utils/db.js";
import userRoutes from "./Routes/user.routes.js";
import companyRoutes from "./Routes/company.routes.js";
import jobRoutes from "./Routes/job.route.js";
import applicationRoutes from "./Routes/application.route.js";
import {
  allowedOrigins,
  apiLimiter,
  sanitizeInput,
  verifyOrigin,
} from "./middlewares/security.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

// fail fast on missing/weak configuration instead of misbehaving at runtime
const missing = ["MONGO_URI", "SECRET_KEY", "CLOUD_NAME", "API_KEY", "API_SECRET"].filter(
  (key) => !process.env[key],
);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")} (see .env.example)`);
  process.exit(1);
}
if (process.env.SECRET_KEY.length < 32) {
  console.error("SECRET_KEY must be at least 32 characters; generate one with:");
  console.error(`  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`);
  process.exit(1);
}

const app = express();

// behind a reverse proxy (Render, Railway, Nginx...) so rate limits see the real client IP
if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);

//middleware
app.use(helmet()); // security headers, hides X-Powered-By
app.use(compression());
app.use(
  cors({
    origin: allowedOrigins, // set FRONTEND_URL in .env (comma-separated for several)
    credentials: true, // allows cookies to be sent
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(sanitizeInput); // strip $operators from input (NoSQL injection)
app.use(verifyOrigin); // CSRF: block state-changing requests from other sites
app.use("/api", apiLimiter);

const PORT = process.env.PORT || 8000;

//API routes
app.get("/api/v1/health", (req, res) => res.json({ status: "ok", success: true }));
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/job", jobRoutes);
app.use("/api/v1/application", applicationRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
