import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Wraps a page so only logged-in users with an allowed role can open it.
// Logged-out users go to /login; users with the wrong role go to their home page.
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useSelector((store) => store.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const home = user.role === "recruiter" ? "/admin/companies" : "/";
    return <Navigate to={home} replace />;
  }

  return children;
};

export default ProtectedRoute;
