import { User } from "../models/user.model.js";

// Use after isAuthenticated. Looks up the user's role from the DB (the JWT only
// carries userId) and blocks the request if it isn't one of the allowed roles.
const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.id).select("role");
      if (!user) {
        return res
          .status(401)
          .json({ message: "User not found", success: false });
      }
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          message: `Only ${roles.join(" or ")} accounts can do this`,
          success: false,
        });
      }
      req.role = user.role;
      next();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server error", success: false });
    }
  };
};

export default authorizeRoles;
