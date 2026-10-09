import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, Search, Send } from "lucide-react";
import { Button } from "./ui/button";

const steps = [
  {
    icon: Search,
    title: "Search & filter",
    text: "Find roles by title, skill or city, then narrow by location, role and salary.",
  },
  {
    icon: Bookmark,
    title: "Save for later",
    text: "Bookmark jobs you like and come back to them from any device.",
  },
  {
    icon: Send,
    title: "Apply & track",
    text: "Apply in one click and see when recruiters accept your application.",
  },
];

// "How it works" trio + recruiter call-to-action band for the home page.
const HowItWorks = () => (
  <>
    <section className="border-y border-line bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            From search to offer, in three steps
          </h2>
        </div>
        <ol className="mt-12 grid gap-5 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-sm text-ink-muted">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
      <div className="relative isolate overflow-hidden rounded-3xl bg-ink px-6 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl"
        />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Hiring? Post a job in minutes.</h2>
            <p className="mt-3 text-brand-100/80">
              Create a recruiter account, add your company and start receiving
              applications today.
            </p>
          </div>
          <Link to="/signup" className="shrink-0">
            <Button size="lg" className="bg-white text-ink shadow-none hover:bg-brand-50">
              Start hiring <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </>
);

export default HowItWorks;
