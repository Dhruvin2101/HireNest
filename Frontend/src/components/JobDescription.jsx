import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from "@/utils/Constants";
import { setSingleJob } from "@/redux/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Navbar from "./shared/Navbar.jsx";
import CompanyLogo from "./shared/CompanyLogo.jsx";
import {
  ArrowLeft,
  Banknote,
  Bookmark,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Loader2,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react";
import JobTags from "./shared/JobTags.jsx";
import Footer from "./Footer.jsx";
import { postedAgo } from "@/utils/format.js";
import useSaveJob from "@/hooks/useSaveJob.jsx";

const JobDescription = () => {
  const params = useParams();
  const jobId = params.id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singleJob: storedJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  // ignore the previously viewed job (persisted in redux) until this one loads
  const singleJob = storedJob?._id === jobId ? storedJob : null;
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error
  const [applying, setApplying] = useState(false);
  const { isSaved, toggleSave, saving, canSave } = useSaveJob(jobId);

  const isApplied = Boolean(singleJob?.hasApplied);
  const isStudentOrVisitor = !user || user.role === "student";
  const isOwner = user?.role === "recruiter" && singleJob?.created_by === user?._id;

  const applyJobHandler = async () => {
    if (!user) {
      toast.error("Please login as a student to apply");
      navigate("/login");
      return;
    }
    try {
      setApplying(true);
      const res = await axios.post(`${APPLICATION_API_END_POINT}/apply/${jobId}`);
      if (res.data.success) {
        dispatch(
          setSingleJob({
            ...singleJob,
            hasApplied: true,
            applicantCount: (singleJob?.applicantCount || 0) + 1,
          }),
        );
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Could not apply, please try again");
    } finally {
      setApplying(false);
    }
  };

  // refetch when the job or the logged-in user changes (hasApplied depends on the user)
  useEffect(() => {
    let ignore = false;
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/getJobById/${jobId}`);
        if (!ignore && res.data.success) {
          dispatch(setSingleJob(res.data.job));
          setStatus("ready");
        }
      } catch (error) {
        console.log(error);
        if (!ignore) setStatus(error.response?.status === 404 ? "notfound" : "error");
      }
    };
    fetchSingleJob();
    return () => {
      ignore = true;
    };
  }, [jobId, dispatch, user?._id]);

  if (!singleJob && status !== "ready") {
    return (
      <div>
        <Navbar />
        <div className="max-w-6xl mx-auto my-14 px-4">
          {status === "loading" ? (
            <div className="flex items-center gap-2 text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading job...
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-paper text-center py-16">
              <p className="font-medium text-lg text-ink">
                {status === "notfound"
                  ? "This job doesn't exist or has been removed."
                  : "Could not load this job. Please try again."}
              </p>
              <Link to="/jobs" className="mt-3 inline-block font-medium text-brand-600 hover:text-brand-700">
                Browse other jobs
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const company = singleJob?.company;
  const overview = [
    { icon: Banknote, label: "Salary", value: `${singleJob?.salary} LPA` },
    {
      icon: GraduationCap,
      label: "Experience",
      value:
        singleJob?.experienceLevel === 0
          ? "Freshers welcome"
          : `${singleJob?.experienceLevel} yrs`,
    },
    { icon: Briefcase, label: "Job type", value: singleJob?.jobType },
    { icon: Users, label: "Open positions", value: singleJob?.position },
    { icon: UserCheck, label: "Applicants", value: singleJob?.applicantCount ?? 0 },
    { icon: CalendarDays, label: "Posted", value: postedAgo(singleJob?.createdAt) },
  ];

  return (
    <div>
      <Navbar />
      <section className="relative isolate overflow-hidden border-b border-line bg-paper">
        <div aria-hidden className="absolute inset-0 -z-10 bg-blueprint opacity-70" />
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" /> All jobs
          </Link>
          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <CompanyLogo company={company} className="h-16 w-16 shrink-0 shadow-card" />
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{singleJob?.title}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-ink-soft">
                  <span className="font-medium text-ink">{company?.name}</span>
                  {singleJob?.location && (
                    <span className="inline-flex items-center gap-1 text-sm text-ink-muted">
                      <MapPin className="h-3.5 w-3.5" /> {singleJob.location}
                    </span>
                  )}
                </p>
                <JobTags job={singleJob} className="mt-3" />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {canSave && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleSave}
                  disabled={saving}
                  aria-pressed={isSaved}
                >
                  <Bookmark className={isSaved ? "fill-brand-600 text-brand-600" : ""} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
              )}
              {isStudentOrVisitor && (
                <Button
                  size="lg"
                  onClick={applyJobHandler}
                  disabled={isApplied || applying}
                  className={isApplied ? "bg-brand-100 text-brand-800 shadow-none disabled:opacity-100" : ""}
                >
                  {applying && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isApplied && <CheckCircle2 className="h-4 w-4" />}
                  {isApplied ? "Already Applied" : user ? "Apply Now" : "Login to Apply"}
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(`/admin/jobs/${jobId}/edit`)}
                >
                  Edit Job
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-ink">About the role</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">
              {singleJob?.description}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">Requirements</h2>
            {singleJob?.requirements?.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {singleJob.requirements.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800 ring-1 ring-inset ring-brand-100"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-ink-muted">Not specified</p>
            )}
          </section>

          {company && (
            <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <div className="flex items-center gap-3">
                <CompanyLogo company={company} className="h-10 w-10" />
                <h2 className="text-lg font-semibold text-ink">About {company.name}</h2>
              </div>
              {company.description ? (
                <p className="mt-4 whitespace-pre-line text-ink-soft">{company.description}</p>
              ) : (
                <p className="mt-4 text-ink-muted">No company description yet.</p>
              )}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-soft">
                {company.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {company.location}
                  </span>
                )}
                {/* only real web links (older data wasn't validated; blocks javascript: URLs) */}
                {/^https?:\/\//i.test(company.website || "") && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800 break-all"
                  >
                    <ExternalLink className="h-4 w-4" /> {company.website}
                  </a>
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="font-semibold text-ink">Job overview</h2>
            <dl className="mt-4 space-y-4">
              {overview.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <dt className="text-xs text-ink-muted">{label}</dt>
                    <dd className="text-sm font-medium text-ink">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default JobDescription;
