import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// Company logo with an initials fallback (replaces the old hardcoded placeholder image).
const CompanyLogo = ({ company, className = "" }) => {
  const initials = (company?.name || "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className={`rounded-md ${className}`}>
      {company?.logo && (
        <AvatarImage src={company.logo} alt={`${company?.name || "Company"} logo`} />
      )}
      <AvatarFallback className="rounded-md bg-brand-50 text-brand-600 font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default CompanyLogo;
