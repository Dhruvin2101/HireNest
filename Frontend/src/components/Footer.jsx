import { Link } from "react-router-dom";
import Logo from "./shared/Logo.jsx";

const columns = [
  {
    title: "For candidates",
    links: [
      { to: "/jobs", label: "Find jobs" },
      { to: "/browse", label: "Browse" },
      { to: "/signup", label: "Create account" },
    ],
  },
  {
    title: "For recruiters",
    links: [
      { to: "/signup", label: "Post a job" },
      { to: "/login", label: "Recruiter login" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-ink text-brand-100/70">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Link to="/" aria-label="HireNest home">
              <Logo inverted />
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              The simple way for students to find jobs and for recruiters to hire them.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-sm">
          © {new Date().getFullYear()} HireNest. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
