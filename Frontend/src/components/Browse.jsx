import { useDispatch, useSelector } from "react-redux";
import { Loader2, Search } from "lucide-react";
import Navbar from "./shared/Navbar.jsx";
import PageHeader from "./shared/PageHeader.jsx";
import Footer from "./Footer.jsx";
import Job from "./Job.jsx";
import useGetAllJobs from "@/hooks/useGetAllJobs.jsx";
import { setSearchJobByText } from "@/redux/jobSlice";

const Browse = () => {
  const dispatch = useDispatch();
  const { allJobs = [], searchJobByText = "" } = useSelector(
    (store) => store.job || {},
  );
  const { loading } = useGetAllJobs(searchJobByText);
  const searchHandler = (e) => {
    e.preventDefault();
    const query = new FormData(e.currentTarget).get("query") || "";
    dispatch(setSearchJobByText(String(query).trim()));
  };

  const title = searchJobByText ? (
    <>
      Results for <span className="text-brand-600">“{searchJobByText}”</span>
    </>
  ) : (
    "All jobs"
  );

  return (
    <div>
      <Navbar />
      <PageHeader
        eyebrow={
          loading ? "Searching…" : `${allJobs.length} ${allJobs.length === 1 ? "job" : "jobs"}`
        }
        title={title}
        actions={
          <form
            onSubmit={searchHandler}
            role="search"
            className="flex w-full items-center gap-2 rounded-full border border-line bg-white p-1 pl-4 shadow-card focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100 sm:w-96"
          >
            <Search className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
            {/* key resets the input when the search changes from outside (navbar, hero, category) */}
            <input
              key={searchJobByText}
              type="text"
              name="query"
              defaultValue={searchJobByText}
              placeholder="Search jobs..."
              aria-label="Search jobs"
              className="w-full min-w-0 bg-transparent py-1.5 text-sm text-ink outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              aria-label="Search"
              className="shrink-0 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Search
            </button>
          </form>
        }
      />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center gap-2 text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Searching jobs...
          </div>
        ) : allJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper text-center py-16 text-ink-soft">
            <p className="font-medium text-ink">No jobs match your search.</p>
            <p className="text-sm mt-1">Try a different keyword or a broader term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allJobs.map((job) => (
              <div key={job._id}>
                <Job job={job} />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Browse;
