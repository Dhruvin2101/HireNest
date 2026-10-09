import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Compass } from "lucide-react";
import Navbar from "./shared/Navbar.jsx";
import { Button } from "./ui/button";

const NotFound = () => {
  const { user } = useSelector((store) => store.auth);
  const isRecruiter = user?.role === "recruiter";

  return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Compass className="h-8 w-8" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Error 404
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold">
          This page took a <span className="text-brand-600">different job</span>
        </h1>
        <p className="mt-4 text-ink-soft">
          The page you're looking for doesn't exist or may have been moved.
          Check the URL, or head back to somewhere familiar.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to={isRecruiter ? "/admin/companies" : "/"}>
            <Button className="bg-brand-600 hover:bg-brand-700 text-white">
              {isRecruiter ? "Go to Dashboard" : "Go Home"}
            </Button>
          </Link>
          <Link to={isRecruiter ? "/admin/jobs" : "/jobs"}>
            <Button variant="outline">
              {isRecruiter ? "View Your Jobs" : "Browse Jobs"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
