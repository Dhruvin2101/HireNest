import { useNavigate } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import CompanyLogo from "./shared/CompanyLogo.jsx";
import JobTags from "./shared/JobTags.jsx";
import { postedAgo } from "@/utils/format.js";

// Compact, fully clickable card for the home page "Latest openings" grid.
const LatestJobCard = ({ job }) => {
  const navigate = useNavigate();
  const open = () => navigate(`/description/${job?._id}`);

  return (
    <div
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter") open();
      }}
      role="link"
      tabIndex={0}
      className="group flex h-full cursor-pointer flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
    >
      <div className="flex items-start gap-3">
        <CompanyLogo company={job?.company} className="h-11 w-11 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{job?.company?.name}</p>
          <p className="flex items-center gap-1 text-xs text-ink-muted">
            <MapPin className="h-3 w-3" aria-hidden /> {job?.location}
          </p>
        </div>
        <ArrowUpRight
          className="h-5 w-5 shrink-0 text-ink-muted transition-colors group-hover:text-brand-600"
          aria-hidden
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug text-ink">{job?.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{job?.description}</p>
      <div className="mt-auto pt-5">
        <JobTags job={job} />
        <p className="mt-3 text-xs text-ink-muted">Posted {postedAgo(job?.createdAt).toLowerCase()}</p>
      </div>
    </div>
  );
};

export default LatestJobCard;
