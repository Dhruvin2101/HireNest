import { Banknote, Briefcase, Users } from "lucide-react";

const tagBase = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium";

// Job type / salary / positions chips shared by every job card and the job page
const JobTags = ({ job, className = "" }) => (
  <ul className={`flex flex-wrap items-center gap-1.5 ${className}`}>
    <li className={`${tagBase} bg-brand-50 text-brand-700`}>
      <Banknote className="h-3.5 w-3.5" aria-hidden />
      {job?.salary} LPA
    </li>
    <li className={`${tagBase} bg-paper text-ink-soft ring-1 ring-inset ring-line`}>
      <Briefcase className="h-3.5 w-3.5" aria-hidden />
      {job?.jobType}
    </li>
    <li className={`${tagBase} bg-paper text-ink-soft ring-1 ring-inset ring-line`}>
      <Users className="h-3.5 w-3.5" aria-hidden />
      {job?.position} {Number(job?.position) === 1 ? "position" : "positions"}
    </li>
  </ul>
);

export default JobTags;
