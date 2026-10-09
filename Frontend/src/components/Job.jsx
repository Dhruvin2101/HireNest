import { Bookmark, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import CompanyLogo from "./shared/CompanyLogo.jsx";
import JobTags from "./shared/JobTags.jsx";
import { useNavigate } from "react-router-dom";
import useSaveJob from "@/hooks/useSaveJob.jsx";
import { postedAgo } from "@/utils/format.js";

// Job card used on Jobs, Browse and Saved Jobs.
const Job = ({ job }) => {
  const navigate = useNavigate();
  const { isSaved, toggleSave, saving, canSave } = useSaveJob(job?._id);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:border-brand-200 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <CompanyLogo company={job?.company} className="h-11 w-11 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{job?.company?.name}</p>
          <p className="flex items-center gap-1 text-xs text-ink-muted">
            <MapPin className="h-3 w-3" aria-hidden /> {job?.location}
            <span aria-hidden>·</span> {postedAgo(job?.createdAt)}
          </p>
        </div>
        {canSave && (
          <button
            type="button"
            onClick={toggleSave}
            disabled={saving}
            aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
            aria-pressed={isSaved}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors disabled:opacity-50 ${
              isSaved
                ? "border-brand-200 bg-brand-50 text-brand-600"
                : "border-line text-ink-muted hover:border-brand-200 hover:text-brand-600"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-brand-600" : ""}`} />
          </button>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-ink">{job?.title}</h3>
      <p className="mt-1.5 line-clamp-3 text-sm text-ink-soft">{job?.description}</p>

      <JobTags job={job} className="mt-4" />

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <Button onClick={() => navigate(`/description/${job?._id}`)}>Details</Button>
        {canSave && (
          <Button variant="outline" onClick={toggleSave} disabled={saving}>
            {isSaved ? "Saved" : "Save for Later"}
          </Button>
        )}
      </div>
    </article>
  );
};

export default Job;
