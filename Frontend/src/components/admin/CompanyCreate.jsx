import { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { COMPANY_API_END_POINT } from "@/utils/Constants.js";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setSingleCompany } from "@/redux/companySlice.js";

const CompanyCreate = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const registerNewCompany = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Please enter a company name");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${COMPANY_API_END_POINT}/registerCompany`, {
        companyName: companyName.trim(),
      });
      if (res?.data?.success) {
        dispatch(setSingleCompany(res.data.company));
        toast.success(res.data.message);
        navigate(`/admin/companies/${res.data.company._id}`);
      }
    } catch (error) {
      console.log(error);
      // e.g. "Company already exists" — previously this failed silently
      toast.error(error.response?.data?.message || "Could not create the company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-paper">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">New company</p>
          <h1 className="mt-1.5 text-3xl font-semibold text-ink">What's your company called?</h1>
          <p className="mt-2 text-ink-soft">
            Start with the name. You can add a logo, website and description next, and change any of it later.
          </p>
        </div>

        <form onSubmit={registerNewCompany} className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            type="text"
            className="my-2"
            placeholder="JobHunt, Microsoft etc."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            maxLength={80}
            required
            autoFocus
          />
          <div className="mt-8 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/companies")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyCreate;
