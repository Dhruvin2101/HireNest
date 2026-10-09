import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Logo from "../shared/Logo.jsx";

const points = [
  "Browse jobs from companies that are hiring now",
  "Save roles and apply in one click",
  "Track every application from your profile",
];

// Split auth screen: form on the left, blue brand panel on the right (desktop only).
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="grid min-h-svh lg:grid-cols-2">
    <div className="relative isolate flex flex-col px-4 py-6 sm:px-8">
      <div aria-hidden className="absolute inset-0 -z-10 bg-blueprint opacity-60 lg:hidden" />
      <Link to="/" aria-label="HireNest home" className="self-start">
        <Logo />
      </Link>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <h1 className="text-3xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>}
      </div>
    </div>

    <aside className="relative isolate hidden overflow-hidden bg-brand-600 lg:flex lg:flex-col lg:justify-center lg:px-16">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(to_right,rgb(255_255_255/0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.12)_1px,transparent_1px)] [background-size:44px_44px]"
      />
      <div aria-hidden className="absolute -bottom-32 -right-32 -z-10 h-96 w-96 rounded-full bg-brand-400/50 blur-3xl" />
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-100">HireNest</p>
      <h2 className="mt-3 max-w-md text-4xl font-semibold leading-tight text-white">
        The simple way to get hired, and to hire.
      </h2>
      <ul className="mt-8 space-y-3">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-brand-50">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-200" />
            {point}
          </li>
        ))}
      </ul>
    </aside>
  </div>
);

export default AuthLayout;
