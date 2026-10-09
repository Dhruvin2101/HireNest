import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut, Menu, User2, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/Constants.js";
import { setUser } from "@/redux/authSlice";
import { setSearchJobByText } from "@/redux/jobSlice";
import Logo from "./Logo.jsx";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const logoutHandler = async () => {
    try {
      const res = await axios.post(`${USER_API_END_POINT}/logout`);
      toast.success(res.data.message);
    } catch (error) {
      console.log(error);
    } finally {
      // always log out locally, even if the server call failed
      dispatch(setUser(null));
      navigate("/");
    }
  };

  // links shown in both the desktop bar and the mobile menu
  const navLinks =
    user && user.role === "recruiter"
      ? [
          { to: "/admin/companies", label: "Companies" },
          { to: "/admin/jobs", label: "Jobs" },
        ]
      : [
          { to: "/", label: "Home", end: true },
          { to: "/jobs", label: "Jobs" },
          {
            to: "/browse",
            label: "Browse",
            onClick: () => dispatch(setSearchJobByText("")),
          },
          ...(user ? [{ to: "/saved-jobs", label: "Saved" }] : []),
        ];

  const initials = (user?.fullName || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const desktopLinkClass = ({ isActive }) =>
    `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
      isActive ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="flex items-center justify-between mx-auto h-16 max-w-7xl px-4">
        <Link to="/" onClick={() => setMenuOpen(false)} aria-label="HireNest home">
          <Logo />
        </Link>
        <div className="flex items-center gap-3 md:gap-8">
          <nav aria-label="Main">
            <ul className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end={link.end} onClick={link.onClick} className={desktopLinkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          {!user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar
                  className="cursor-pointer ring-2 ring-white outline outline-1 outline-line"
                  aria-label="Account menu"
                >
                  <AvatarImage src={user?.profile?.profilePhoto} />
                  <AvatarFallback className="bg-brand-50 text-brand-700 text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>

              <PopoverContent className="w-72 max-w-[calc(100vw-2rem)] p-0" align="end">
                <div className="flex gap-3 p-4 border-b border-line">
                  <Avatar>
                    <AvatarImage src={user?.profile?.profilePhoto} />
                    <AvatarFallback className="bg-brand-50 text-brand-700 text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-ink truncate">{user?.fullName}</h4>
                    <p className="text-xs text-ink-muted truncate">{user?.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium capitalize text-brand-700">
                      {user?.role}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col p-1.5 text-sm">
                  {user && user.role === "student" && (
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-ink-soft hover:bg-brand-50 hover:text-brand-800"
                    >
                      <User2 className="h-4 w-4" /> View profile
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logoutHandler}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-ink-soft hover:bg-brand-50 hover:text-brand-800"
                  >
                    <LogOut className="h-4 w-4" /> Log Out
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <button
            type="button"
            className="md:hidden p-2 -mr-2 rounded-full text-ink hover:bg-brand-50"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden absolute inset-x-0 top-16 border-b border-line bg-white px-4 pb-4 shadow-card"
        >
          <ul className="flex flex-col font-medium">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  onClick={() => {
                    link.onClick?.();
                    setMenuOpen(false);
                  }}
                  className={({ isActive }) =>
                    `block py-3 border-b border-line ${isActive ? "text-brand-700" : "text-ink"}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {!user && (
            <div className="flex gap-3 pt-4">
              <Link to="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/signup" className="flex-1" onClick={() => setMenuOpen(false)}>
                <Button className="w-full">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
