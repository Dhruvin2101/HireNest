import Navbar from "../shared/Navbar.jsx";
import PageHeader from "../shared/PageHeader.jsx";
import Footer from "../Footer.jsx";
import { Plus, Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import CompaniesTable from "./CompaniesTable.jsx";
import { useNavigate } from "react-router-dom";
import useGetAllCompanies from "@/hooks/useGetAllCompanies.jsx";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSearchCompanyByText } from "@/redux/companySlice.js";

const Companies = () => {
  useGetAllCompanies();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setSearchCompanyByText(input));
  }, [input, dispatch]);
  return (
    <div>
      <Navbar />
      <PageHeader
        eyebrow="Recruiter"
        title="Companies"
        description="Companies you hire for. Add details and a logo so candidates recognise you."
        actions={
          <Button size="lg" onClick={() => navigate("/admin/companies/create")}>
            <Plus className="h-4 w-4" /> New Company
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
                placeholder="Filter companies by name"
                aria-label="Filter companies by name"
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          </div>
          <div className="p-2 sm:p-4">
            <CompaniesTable />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Companies;
