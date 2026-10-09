import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Please login to continue", success: false });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY, {
      algorithms: ["HS256"],
    });
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Invalid token", success: false });
    }
    req.id = decoded.userId;
    next();

  } catch (error) {
    // jwt.verify throws on expired/malformed tokens — respond instead of hanging
    console.log(error.message);
    return res
      .status(401)
      .json({ message: "Session expired, please login again", success: false });
  }
};

export default isAuthenticated;