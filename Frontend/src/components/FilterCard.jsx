import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { ROLE_FILTERS, SALARY_FILTERS } from "@/utils/jobFilters.js";

// Presentational sidebar: the Jobs page owns the filter state and does the filtering.
// One radio group per filter type, so you can pick a location AND a role AND a salary.
const FilterCard = ({ filters, locations, onChange, onClear }) => {
  const groups = [
    { key: "location", title: "Location", options: locations },
    { key: "role", title: "Role", options: ROLE_FILTERS.map((item) => item.label) },
    { key: "salary", title: "Salary", options: SALARY_FILTERS.map((item) => item.label) },
  ];
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="w-full rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Filter jobs</h2>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full px-2 py-0.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            Clear
          </button>
        )}
      </div>
      {groups.map((group) => (
        <fieldset key={group.key} className="mt-5 border-t border-line pt-4">
          <legend className="sr-only">{group.title}</legend>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {group.title}
          </h3>
          {group.options.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">No options yet</p>
          ) : (
            <RadioGroup
              value={filters[group.key]}
              onValueChange={(value) => onChange(group.key, value)}
              aria-label={group.title}
              className="mt-2 gap-0.5"
            >
              {group.options.map((option) => {
                const id = `${group.key}-${option}`;
                const selected = filters[group.key] === option;
                return (
                  <div
                    key={id}
                    className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors ${
                      selected ? "bg-brand-50" : "hover:bg-paper"
                    }`}
                  >
                    <RadioGroupItem value={option} id={id} />
                    <Label
                      htmlFor={id}
                      className={`cursor-pointer font-normal ${selected ? "text-brand-800" : "text-ink-soft"}`}
                    >
                      {option}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          )}
        </fieldset>
      ))}
    </div>
  );
};

export default FilterCard;
