import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/authSlice";
import { Bookmark, Loader2 } from "lucide-react";
import Navbar from "./shared/Navbar.jsx";
import PageHeader from "./shared/PageHeader.jsx";
import Footer from "./Footer.jsx";
import Job from "./Job.jsx";
import { USER_API_END_POINT } from "@/utils/Constants.js";

const SavedJobs = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  // latest user without re-running the fetch effect every time user changes
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await axios.get(`${USER_API_END_POINT}/saved-jobs`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setJobs(res.data.savedJobs);
          // sync the bookmark ids with the server (older sessions may not have them)
          dispatch(
            setUser({ ...userRef.current, savedJobs: res.data.savedJobs.map((job) => job._id) }),
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, [dispatch]);

  // hide a job as soon as it is unsaved from its card (savedJobs ids update in redux)
  const savedIds = (user?.savedJobs || []).map(String);
  const visibleJobs = jobs.filter((job) => savedIds.includes(String(job._id)));

  return (
    <div>
      <Navbar />
      <PageHeader
        eyebrow={`${visibleJobs.length} saved`}
        title="Saved jobs"
        description="Jobs you bookmarked to come back to later."
      />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center gap-2 text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading saved jobs...
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper text-center py-16 text-ink-soft">
            <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Bookmark className="h-5 w-5" />
            </span>
            <p className="font-medium text-ink">You haven't saved any jobs yet.</p>
            <p className="text-sm mt-1">
              Tap the bookmark on any job to keep it here.{" "}
              <Link to="/jobs" className="text-brand-600 hover:underline">
                Browse jobs
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleJobs.map((job) => (
              <div key={job._id}>
                <Job job={job} />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SavedJobs;
