import { useEffect, useState } from "react";
import axios from "axios";
import { COMPANY_API_END_POINT } from "@/utils/Constants";
import { useDispatch } from "react-redux";
import { setSingleCompany } from "@/redux/companySlice";

// Loads one of the recruiter's companies into redux. Returns { error } for the page to show.
const useGetCompanyById = (companyId) => {
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    const fetchSingleCompany = async () => {
      try {
        const res = await axios.get(`${COMPANY_API_END_POINT}/getCompany/${companyId}`);
        if (!ignore && res.data.success) {
          setError("");
          dispatch(setSingleCompany(res.data.company));
        }
      } catch (err) {
        console.log(err);
        if (!ignore) setError(err.response?.data?.message || "Could not load the company");
      }
    };
    fetchSingleCompany();
    return () => {
      ignore = true;
    };
  }, [companyId, dispatch]);

  return { error };
};

export default useGetCompanyById;
