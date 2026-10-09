import jwt from "jsonwebtoken";

// Like isAuthenticated, but never blocks: sets req.id when a valid token is present
// so public pages (job list/details) can still personalise the response.
const optionalAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      req.id = jwt.verify(token, process.env.SECRET_KEY, {
        algorithms: ["HS256"],
      }).userId;
    } catch {
      // expired/invalid token: treat as a visitor
    }
  }
  next();
};

export default optionalAuth;
