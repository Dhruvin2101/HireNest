import { useEffect, useState } from "react";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "@/utils/Constants";
import { useDispatch } from "react-redux";
import { setAllApplicants } from "@/redux/applicationSlice";

// Fetches a job with its applications (and applicant details) for the recruiter.
// Returns { loading, error } so the page can show the right state.
const useGetApplicants = (jobId) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      setError("");
      dispatch(setAllApplicants(null));
      try {
        const res = await axios.get(
          `${APPLICATION_API_END_POINT}/${jobId}/applicants`,
          { withCredentials: true },
        );
        if (res.data.success) {
          dispatch(setAllApplicants(res.data.job));
        }
      } catch (error) {
        console.log(error);
        setError(error.response?.data?.message || "Could not load applicants");
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [jobId, dispatch]);

  return { loading, error };
};

export default useGetApplicants;
