import { useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import axios from "axios";
import { COMPANY_API_END_POINT } from "@/utils/Constants.js";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import useGetCompanyById from "@/hooks/useGetCompanyById.jsx";
import CompanyLogo from "../shared/CompanyLogo.jsx";

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // same limit as the server

// The form gets the loaded company as its starting values, so no effect is needed to copy them.
const CompanyForm = ({ company }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    name: company.name || "",
    description: company.description || "",
    website: company.website || "",
    location: company.location || "",
    file: null,
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > MAX_LOGO_SIZE) {
      toast.error("Logo is too large (max 2 MB)");
      e.target.value = "";
      return;
    }
    setInput({ ...input, file });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("description", input.description);
    formData.append("website", input.website);
    formData.append("location", input.location);
    if (input.file) {
      formData.append("file", input.file);
    }
    try {
      setLoading(true);
      const res = await axios.put(
        `${COMPANY_API_END_POINT}/updateCompany/${company._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/companies");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Could not update the company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
      <div className="flex items-center gap-4 mb-6">
        <CompanyLogo company={company} className="h-14 w-14" />
        <p className="text-sm text-ink-muted">
          Add details so candidates know who they're applying to.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="mb-2">Company Name</Label>
          <Input
            id="name"
            type="text"
            name="name"
            value={input.name}
            onChange={changeEventHandler}
            maxLength={80}
            required
          />
        </div>
        <div>
          <Label htmlFor="location" className="mb-2">Location</Label>
          <Input
            id="location"
            type="text"
            name="location"
            value={input.location}
            onChange={changeEventHandler}
            maxLength={100}
            placeholder="Pune"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description" className="mb-2">Description</Label>
          <textarea
            id="description"
            name="description"
            value={input.description}
            onChange={changeEventHandler}
            maxLength={1000}
            rows={3}
            placeholder="What does your company do?"
            className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div>
          <Label htmlFor="website" className="mb-2">Website</Label>
          <Input
            id="website"
            type="url"
            name="website"
            value={input.website}
            onChange={changeEventHandler}
            placeholder="https://example.com"
            pattern="https?://.+"
            title="Must start with http:// or https://"
          />
        </div>
        <div>
          <Label htmlFor="logo" className="mb-2">Logo</Label>
          <Input
            id="logo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={changeFileHandler}
          />
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full mt-8" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
          </>
        ) : (
          "Update"
        )}
      </Button>
    </form>
  );
};

const CompanySetup = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { error } = useGetCompanyById(params.id);
  const { singleCompany } = useSelector((store) => store.company);
  // ignore a different company left over in redux from an earlier page
  const company = singleCompany?._id === params.id ? singleCompany : null;

  return (
    <div className="min-h-svh bg-paper">
      <Navbar />
      <div className="max-w-xl mx-auto my-10 px-4">
        <div className="flex items-center gap-5 py-6">
          <Button
            type="button"
            onClick={() => navigate("/admin/companies")}
            variant="outline"
            className="flex items-center gap-2 text-ink-muted font-semibold"
          >
            <ArrowLeft />
            <span>Back</span>
          </Button>
          <h1 className="text-2xl font-semibold text-ink">Company setup</h1>
        </div>
        {company ? (
          // key resets the form if a different company is opened
          <CompanyForm key={company._id} company={company} />
        ) : error ? (
          <p className="text-ink">{error}</p>
        ) : (
          <div className="flex items-center gap-2 text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading company...
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySetup;
