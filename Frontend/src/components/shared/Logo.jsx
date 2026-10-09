import { Briefcase } from "lucide-react";

// Brand mark: blue rounded square with a briefcase + "HireNest" wordmark.
// `inverted` is for dark backgrounds (footer).
const Logo = ({ inverted = false, className = "" }) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white shadow-sm shadow-brand-600/30">
      <Briefcase className="h-4 w-4" strokeWidth={2.25} />
    </span>
    <span
      className={`text-xl font-semibold tracking-tight ${inverted ? "text-white" : "text-ink"}`}
    >
      Hire<span className={inverted ? "text-brand-300" : "text-brand-600"}>Nest</span>
    </span>
  </span>
);

export default Logo;
