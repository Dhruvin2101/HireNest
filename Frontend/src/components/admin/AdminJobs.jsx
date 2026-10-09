import Navbar from "../shared/Navbar.jsx";
import PageHeader from "../shared/PageHeader.jsx";
import Footer from "../Footer.jsx";
import { Plus, Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSearchCompanyByText } from "@/redux/companySlice.js";
import useGetAllAdminJobs from "@/hooks/useGetAllAdminJobs.jsx";
import AdminJobsTable from "./AdminJobsTable.jsx";

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchCompanyByText(""));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setSearchCompanyByText(input));
  }, [input, dispatch]);

  return (
    <div>
      <Navbar />
      <PageHeader
        eyebrow="Recruiter"
        title="Your jobs"
        description="Jobs you have posted. Open a job to see its applicants, edit it or remove it."
        actions={
          <Button size="lg" onClick={() => navigate("/admin/jobs/create")}>
            <Plus className="h-4 w-4" /> New Job
          </Button>
        }
      />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <div className="border-b border-line p-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input
                className="pl-9"
                placeholder="Filter by role or company"
                aria-label="Filter by role or company"
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          </div>
          <div className="p-2 sm:p-4">
            <AdminJobsTable />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminJobs;
