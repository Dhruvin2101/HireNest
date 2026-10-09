import { useEffect, useState } from "react";
import axios from "axios";
import { JOB_API_END_POINT } from "@/utils/Constants";
import { useDispatch } from "react-redux";
import { setAllJobs } from "@/redux/jobSlice";

// Loads jobs into redux. Pass a keyword to search (Browse page); omit it for all jobs.
// Returns { loading } so pages can show a loading state.
const useGetAllJobs = (keyword = "") => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false; // drop responses from an older search if the keyword changed
    const fetchAllJobs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/getAllJobs`, {
          params: keyword ? { keyword } : {},
          withCredentials: true,
        });
        if (!ignore && res.data.success) {
          dispatch(setAllJobs(res.data.jobs));
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchAllJobs();
    return () => {
      ignore = true;
    };
  }, [keyword, dispatch]);

  return { loading };
};

export default useGetAllJobs;
