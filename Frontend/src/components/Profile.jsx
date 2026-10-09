import { useState } from "react";
import Navbar from "./shared/Navbar.jsx";
import Footer from "./Footer.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { FileText, Mail, PenLine, Phone } from "lucide-react";
import AppliedJobTable from "./AppliedJobTable.jsx";
import UpdateProfileDialog from "./UpdateProfileDialog.jsx";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs.jsx";

const Profile = () => {
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { allAppliedJobs = [] } = useSelector((store) => store.job);
  const skills = user?.profile?.skills || [];
  const initials = (user?.fullName || "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const counts = {
    total: allAppliedJobs.length,
    accepted: allAppliedJobs.filter((a) => a.status === "accepted").length,
    pending: allAppliedJobs.filter((a) => a.status === "pending").length,
  };

  return (
    <div>
      <Navbar />
      {/* blue cover band + overlapping profile card */}
      <div className="relative h-36 overflow-hidden bg-brand-600 sm:h-44">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgb(255_255_255/0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.12)_1px,transparent_1px)] [background-size:44px_44px]"
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        {/* relative: keeps the card above the (positioned) cover band it overlaps */}
        <section className="relative -mt-16 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4 sm:gap-5 min-w-0">
              <Avatar className="h-20 w-20 shrink-0 ring-4 ring-white sm:h-24 sm:w-24">
                {user?.profile?.profilePhoto && (
                  <AvatarImage src={user.profile.profilePhoto} alt={user?.fullName} />
                )}
                <AvatarFallback className="bg-brand-50 text-xl font-semibold text-brand-700 sm:text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-ink">{user?.fullName}</h1>
                <p className="mt-1 break-words text-ink-soft">
                  {user?.profile?.bio || "Add a short bio so recruiters know you better."}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              aria-label="Edit profile"
              className="shrink-0 self-start sm:self-auto"
            >
              <PenLine className="h-4 w-4" /> Edit profile
            </Button>
          </div>

          <div className="mt-8 grid gap-6 border-t border-line pt-6 md:grid-cols-3">
            <div className="space-y-3 text-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Contact</h2>
              <p className="flex items-center gap-2 text-ink-soft">
                <Mail className="h-4 w-4 text-brand-600" />
                <span className="break-all">{user?.email}</span>
              </p>
              <p className="flex items-center gap-2 text-ink-soft">
                <Phone className="h-4 w-4 text-brand-600" />
                <span>{user?.phoneNumber}</span>
              </p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Skills</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skills.length !== 0 ? (
                  skills.map((item, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800 ring-1 ring-inset ring-brand-100"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-ink-muted">NA</span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Resume</h2>
              {user?.profile?.resume ? (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={user?.profile?.resume}
                  className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium text-brand-700 hover:border-brand-200 hover:bg-brand-50"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{user?.profile?.resumeOriginalName || "View resume"}</span>
                </a>
              ) : (
                <p className="mt-3 text-sm text-ink-muted">No resume uploaded yet</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink">Applied Jobs</h2>
            <dl className="flex gap-2 text-sm">
              {[
                ["Applied", counts.total],
                ["Pending", counts.pending],
                ["Accepted", counts.accepted],
              ].map(([label, value]) => (
                <div key={label} className="rounded-full border border-line bg-white px-3 py-1">
                  <dt className="inline text-ink-muted">{label} </dt>
                  <dd className="inline font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-4 rounded-2xl border border-line bg-white p-2 shadow-card sm:p-4">
            <AppliedJobTable />
          </div>
        </section>
      </div>

      <UpdateProfileDialog open={open} setOpen={setOpen} />
      <Footer />
    </div>
  );
};

export default Profile;
