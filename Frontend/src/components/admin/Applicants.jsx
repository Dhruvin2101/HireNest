import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "../shared/Navbar.jsx";
import { Button } from "../ui/button";
import ApplicantsTable from "./ApplicantsTable.jsx";
import useGetApplicants from "@/hooks/useGetApplicants.jsx";

const Applicants = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { loading, error } = useGetApplicants(params.id);
  const { applicants } = useSelector((store) => store.application);

  return (
    <div className="min-h-svh bg-paper">
      <Navbar />
      <div className="max-w-6xl mx-auto my-10 px-4">
        <div className="flex items-center gap-5 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/jobs")}
            className="flex items-center gap-2 text-ink-muted font-semibold"
          >
            <ArrowLeft />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              Applicants ({applicants?.applications?.length || 0})
            </h1>
            {applicants?.title && (
              <p className="text-sm text-ink-muted">{applicants.title}</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading applicants...
          </div>
        ) : error ? (
          <p className="text-ink">{error}</p>
        ) : (
          <div className="rounded-2xl border border-line bg-white p-2 shadow-card sm:p-4">
            <ApplicantsTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default Applicants;
