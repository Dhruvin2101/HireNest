import { useState } from "react";
import AuthLayout from "./AuthLayout.jsx";
import RoleToggle from "./RoleToggle.jsx";
import { Button } from "../ui/button";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/Constants.js";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice.js";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const [input, setInput] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    file: "",
  });

  const { loading } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const fileChangeEventHandler = (e) => {
    const file = e.target.files?.[0];
    // same 2 MB limit as the server
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error("Photo is too large (max 2 MB)");
      e.target.value = "";
      return;
    }
    setInput({ ...input, file: file || "" });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append("fullName", input.fullName);
      formData.append("email", input.email);
      formData.append("phoneNumber", input.phoneNumber);
      formData.append("password", input.password);
      formData.append("role", input.role);
      if (input.file) {
        formData.append("file", input.file);
      }
      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join as a student to find jobs, or as a recruiter to hire."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submitHandler} className="space-y-5">
        <RoleToggle value={input.role} onChange={changeEventHandler} />
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={input.fullName}
            onChange={changeEventHandler}
            name="fullName"
            autoComplete="name"
            minLength={2}
            maxLength={60}
            required
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={input.email}
              onChange={changeEventHandler}
              name="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              inputMode="tel"
              placeholder="9876543210"
              value={input.phoneNumber}
              onChange={changeEventHandler}
              name="phoneNumber"
              autoComplete="tel"
              pattern="[+]?[0-9 ]{10,18}"
              title="10-15 digit phone number"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={input.password}
            onChange={changeEventHandler}
            name="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="text-xs text-ink-muted">
            At least 8 characters.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="profilePhoto">
            Profile photo <span className="font-normal text-ink-muted">(optional)</span>
          </Label>
          <Input
            id="profilePhoto"
            accept="image/jpeg,image/png,image/webp,image/gif"
            type="file"
            className="cursor-pointer file:mr-3 file:rounded-full file:bg-brand-50 file:px-3 file:text-brand-700"
            onChange={fileChangeEventHandler}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Please wait
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Signup;
