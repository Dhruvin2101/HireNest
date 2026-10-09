import { useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchJobByText } from "@/redux/jobSlice";
import CategoryCarousel from "./CategoryCarousel.jsx";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allJobs = [] } = useSelector((store) => store.job);

  const searchJobHandler = (e) => {
    e.preventDefault();
    dispatch(setSearchJobByText(query.trim()));
    navigate("/browse");
  };

  return (
    <section className="relative isolate overflow-hidden">
      {/* blueprint grid + soft blue glow behind the hero */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-blueprint" />
      <div
        aria-hidden
        className="absolute left-1/2 top-0 -z-10 h-80 w-[44rem] max-w-full -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl"
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-10 pt-14 text-center sm:pb-14 sm:pt-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white/80 px-3.5 py-1 text-sm font-medium text-brand-700 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          {allJobs.length > 0
            ? `${allJobs.length} open ${allJobs.length === 1 ? "role" : "roles"} right now`
            : "Your next job starts here"}
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-6xl">
          Search, apply &amp; get
          <br className="hidden sm:block" /> your{" "}
          <span className="text-brand-600">dream job</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-ink-soft sm:text-lg">
          Find the perfect job that matches your skills and experience, and
          track every application in one place.
        </p>

        <form
          onSubmit={searchJobHandler}
          role="search"
          className="mt-9 flex w-full max-w-xl items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-5 shadow-lift focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100"
        >
          <Search className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, skill or city"
            aria-label="Search jobs"
            className="w-full min-w-0 bg-transparent py-2 text-base text-ink outline-none placeholder:text-ink-muted"
          />
          <button
            type="submit"
            aria-label="Search"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            <span className="hidden sm:inline">Search</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <CategoryCarousel />
      </div>
    </section>
  );
};

export default HeroSection;
