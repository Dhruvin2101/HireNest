import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Loader2, SlidersHorizontal } from "lucide-react";
import Navbar from "./shared/Navbar";
import PageHeader from "./shared/PageHeader.jsx";
import Footer from "./Footer.jsx";
import FilterCard from "./FilterCard.jsx";
import Job from "./Job.jsx";
import useGetAllJobs from "@/hooks/useGetAllJobs.jsx";
import { applyJobFilters, getLocationOptions } from "@/utils/jobFilters.js";

const EMPTY_FILTERS = { location: "", role: "", salary: "" };

const Jobs = () => {
  const { loading } = useGetAllJobs();
  const { allJobs = [] } = useSelector((store) => store.job);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false); // mobile only; always shown on desktop
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const locations = useMemo(() => getLocationOptions(allJobs), [allJobs]);
  const filteredJobs = useMemo(
    () => applyJobFilters(allJobs, filters),
    [allJobs, filters],
  );

  const changeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <Navbar />
      <PageHeader
        eyebrow="Explore"
        title="Find your next role"
        description="Narrow down open positions by location, role and salary."
      />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-64 lg:shrink-0 lg:sticky lg:top-24 lg:self-start">
            <button
              type="button"
              onClick={() => setShowFilters((open) => !open)}
              aria-expanded={showFilters}
              aria-controls="job-filters"
              className="lg:hidden flex w-full items-center justify-between rounded-full border border-line bg-white px-4 py-2.5 font-medium text-ink shadow-sm"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </span>
              <span className="text-sm text-brand-600">{showFilters ? "Hide" : "Show"}</span>
            </button>
            <div
              id="job-filters"
              className={`${showFilters ? "block" : "hidden"} lg:block mt-3 lg:mt-0`}
            >
            <FilterCard
              filters={filters}
              locations={locations}
              onChange={changeFilter}
              onClear={() => setFilters(EMPTY_FILTERS)}
            />
            </div>
          </aside>
          <div className="flex-1 min-w-0 pb-5">
            {/* always wait for the fresh list: allJobs may still hold Browse search results */}
            {loading ? (
              <div className="flex items-center gap-2 text-ink-muted">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading jobs...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-paper text-center py-16 text-ink-soft">
                <p className="font-medium">
                  {allJobs.length === 0
                    ? "No jobs have been posted yet."
                    : "No jobs match these filters."}
                </p>
                {allJobs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilters(EMPTY_FILTERS)}
                    className="mt-3 rounded-full px-3 py-1 text-sm font-medium text-brand-600 hover:bg-brand-50"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-ink-muted mb-4">
                  Showing {filteredJobs.length} of {allJobs.length} jobs
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredJobs.map((job) => (
                    <div key={job?._id}>
                      <Job job={job} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Jobs;
