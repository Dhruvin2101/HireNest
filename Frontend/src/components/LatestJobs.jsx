import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";
import LatestJobCard from "./LatestJobCard";

const LatestJobs = () => {
  const { allJobs = [] } = useSelector((store) => store.job);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Latest &amp; top
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Job openings</h2>
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          View all jobs <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {allJobs.length <= 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-paper px-6 py-14 text-center text-ink-soft">
          No jobs have been posted yet. Check back soon.
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {allJobs.slice(0, 6).map((job) => (
            <LatestJobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
};

export default LatestJobs;
