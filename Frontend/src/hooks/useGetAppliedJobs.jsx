import { useEffect } from "react";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "@/utils/Constants";
import { useDispatch } from "react-redux";
import { setAllAppliedJobs } from "@/redux/jobSlice";

const useGetAppliedJobs = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const res = await axios.get(
          `${APPLICATION_API_END_POINT}/my-applications`,
          { withCredentials: true },
        );
        if (res.data.success) {
          dispatch(setAllAppliedJobs(res.data.applications));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAppliedJobs();
  }, [dispatch]);
};

export default useGetAppliedJobs;
