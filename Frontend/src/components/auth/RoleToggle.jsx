import { GraduationCap, Building2 } from "lucide-react";

const roles = [
  { value: "student", label: "Student", id: "r1", icon: GraduationCap },
  { value: "recruiter", label: "Recruiter", id: "r2", icon: Building2 },
];

// Segmented Student / Recruiter switch. Real radio inputs stay underneath
// (visually hidden), so keyboard use and required-field validation still work.
const RoleToggle = ({ value, onChange }) => (
  <fieldset>
    <legend className="mb-2 text-sm font-medium text-ink">I am a</legend>
    <div className="grid grid-cols-2 gap-1 rounded-full bg-paper p-1 ring-1 ring-inset ring-line">
      {roles.map(({ value: role, label, id, icon: Icon }) => (
        <div key={role}>
          <input
            type="radio"
            id={id}
            name="role"
            value={role}
            checked={value === role}
            onChange={onChange}
            required
            className="peer sr-only"
          />
          <label
            htmlFor={id}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink-muted transition-all hover:text-ink peer-checked:bg-white peer-checked:text-brand-700 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300"
          >
            <Icon className="h-4 w-4" /> {label}
          </label>
        </div>
      ))}
    </div>
  </fieldset>
);

export default RoleToggle;
