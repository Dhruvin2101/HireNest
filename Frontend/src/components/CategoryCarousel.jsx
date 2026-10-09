import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchJobByText } from "@/redux/jobSlice";

const category = [
  "Front End Developer",
  "Back End Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Mobile App Developer",
  "Graphic Designer",
];

// Popular searches as pill chips under the hero search. They wrap on desktop and
// scroll sideways on phones (no arrows needed).
const CategoryCarousel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = (query) => {
    dispatch(setSearchJobByText(query));
    navigate("/browse");
  };

  return (
    <div className="mt-6 w-full">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-muted">
        Popular searches
      </p>
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
        {category.map((item) => (
          <li key={item} className="shrink-0">
            <button
              type="button"
              onClick={() => searchJobHandler(item)}
              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink-soft shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryCarousel;
