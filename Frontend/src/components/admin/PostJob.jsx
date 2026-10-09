import { useEffect, useState } from "react";
import Navbar from "../shared/Navbar.jsx";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { JOB_API_END_POINT } from "@/utils/Constants.js";
import useGetAllCompanies from "@/hooks/useGetAllCompanies.jsx";

const JOB_TYPES = ["Full Time", "Part Time", "Internship", "Contract", "Freelance"];

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Used for both "Post a New Job" (/admin/jobs/create) and "Edit Job" (/admin/jobs/:id/edit)
const PostJob = () => {
  useGetAllCompanies();
  const { id: jobId } = useParams();
  const isEdit = Boolean(jobId);
  const { companies = [] } = useSelector((store) => store.company);
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const navigate = useNavigate();
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "Full Time",
    experience: "",
    position: "",
    companyId: "",
  });

  // edit mode: load the job and fill the form
  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/getJobById/${jobId}`, {
          withCredentials: true,
        });
        const job = res.data.job;
        if (String(job.created_by) !== String(user?._id)) {
          setLoadError("You can only edit jobs you posted.");
          return;
        }
        setInput({
          title: job.title || "",
          description: job.description || "",
          requirements: (job.requirements || []).join(", "),
          salary: String(job.salary ?? ""),
          location: job.location || "",
          jobType: job.jobType || "Full Time",
          experience: String(job.experienceLevel ?? ""),
          position: String(job.position ?? ""),
          companyId: String(job.company?._id || job.company || ""),
        });
      } catch (error) {
        console.log(error);
        setLoadError(error.response?.data?.message || "Could not load this job");
      } finally {
        setLoadingJob(false);
      }
    };
    fetchJob();
  }, [jobId, user?._id]);

  // keep a custom job type from older jobs selectable
  const jobTypes = JOB_TYPES.includes(input.jobType)
    ? JOB_TYPES
    : [...JOB_TYPES, input.jobType];

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!input.companyId) {
      toast.error("Please select a company");
      return;
    }
    try {
      setLoading(true);
      const res = await axios({
        method: isEdit ? "put" : "post",
        url: isEdit
          ? `${JOB_API_END_POINT}/updateJob/${jobId}`
          : `${JOB_API_END_POINT}/createJob`,
        data: input,
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/jobs");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          (isEdit ? "Could not save changes" : "Could not post the job"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-paper">
      <Navbar />
      <div className="max-w-4xl mx-auto my-10 px-4">
        <div className="flex items-center gap-5 mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/jobs")}
            className="flex items-center gap-2 text-ink-muted font-semibold"
          >
            <ArrowLeft />
            <span>Back</span>
          </Button>
          <h1 className="text-2xl font-semibold text-ink">
            {isEdit ? "Edit Job" : "Post a New Job"}
          </h1>
        </div>

        {loadingJob ? (
          <div className="flex items-center gap-2 text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading job...
          </div>
        ) : loadError ? (
          <p className="text-ink">{loadError}</p>
        ) : companies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
            <p className="font-medium">You need a company before you can post a job.</p>
            <p className="text-sm text-ink-muted mt-1">
              Register your company first, then come back here.
            </p>
            <Button
              className="mt-5"
              onClick={() => navigate("/admin/companies/create")}
            >
              Register a Company
            </Button>
          </div>
        ) : (
          <form
            onSubmit={submitHandler}
            className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="mb-2">Job Title</Label>
                <Input
                  name="title"
                  value={input.title}
                  onChange={changeEventHandler}
                  placeholder="Frontend Developer"
                  required
                />
              </div>
              <div>
                <Label className="mb-2">Company</Label>
                <select
                  name="companyId"
                  value={input.companyId}
                  onChange={changeEventHandler}
                  className={selectClass}
                  required
                >
                  <option value="" disabled>
                    Select a company
                  </option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2">Description</Label>
                <textarea
                  name="description"
                  value={input.description}
                  onChange={changeEventHandler}
                  rows={4}
                  placeholder="What will this person work on?"
                  className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2">Requirements</Label>
                <Input
                  name="requirements"
                  value={input.requirements}
                  onChange={changeEventHandler}
                  placeholder="React, Node.js, MongoDB (comma separated)"
                  required
                />
              </div>
              <div>
                <Label className="mb-2">Salary (LPA)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  name="salary"
                  value={input.salary}
                  onChange={changeEventHandler}
                  placeholder="12"
                  required
                />
              </div>
              <div>
                <Label className="mb-2">Location</Label>
                <Input
                  name="location"
                  value={input.location}
                  onChange={changeEventHandler}
                  placeholder="Pune"
                  required
                />
              </div>
              <div>
                <Label className="mb-2">Job Type</Label>
                <select
                  name="jobType"
                  value={input.jobType}
                  onChange={changeEventHandler}
                  className={selectClass}
                >
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-2">Experience (years)</Label>
                <Input
                  type="number"
                  min="0"
                  name="experience"
                  value={input.experience}
                  onChange={changeEventHandler}
                  placeholder="0 for freshers"
                  required
                />
              </div>
              <div>
                <Label className="mb-2">Open Positions</Label>
                <Input
                  type="number"
                  min="1"
                  name="position"
                  value={input.position}
                  onChange={changeEventHandler}
                  placeholder="3"
                  required
                />
              </div>
            </div>

            {loading ? (
              <Button
                type="button"
                disabled
                className="w-full mt-8" size="lg"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full mt-8" size="lg"
              >
                {isEdit ? "Save Changes" : "Post Job"}
              </Button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default PostJob;
