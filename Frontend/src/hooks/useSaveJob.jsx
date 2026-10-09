import { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { USER_API_END_POINT } from "@/utils/Constants";
import { setUser } from "@/redux/authSlice";

// Bookmark state + toggle for one job. Saved job ids live on auth.user.savedJobs,
// so every card for the same job updates together.
const useSaveJob = (jobId) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const [saving, setSaving] = useState(false);

  // older persisted sessions may not have savedJobs yet
  const savedJobs = user?.savedJobs || [];
  const isSaved = savedJobs.some((id) => String(id) === String(jobId));
  const canSave = !user || user.role === "student";

  const toggleSave = async () => {
    if (!user) {
      toast.error("Please login to save jobs");
      navigate("/login");
      return;
    }
    if (saving || !jobId) return;
    try {
      setSaving(true);
      const res = await axios({
        method: isSaved ? "delete" : "put",
        url: `${USER_API_END_POINT}/saved-jobs/${jobId}`,
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser({ ...user, savedJobs: res.data.savedJobs }));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Could not update saved jobs");
    } finally {
      setSaving(false);
    }
  };

  return { isSaved, toggleSave, saving, canSave };
};

export default useSaveJob;
