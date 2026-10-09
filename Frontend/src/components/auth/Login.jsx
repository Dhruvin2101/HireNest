import { useState } from "react";
import AuthLayout from "./AuthLayout.jsx";
import RoleToggle from "./RoleToggle.jsx";
import { Button } from "../ui/button";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import { Link, useNavigate } from "react-router-dom";
import { USER_API_END_POINT } from "@/utils/Constants.js";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice.js";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "",
  });

  const { loading } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        navigate("/");
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
      title="Welcome back"
      subtitle="Log in to apply for jobs, track applications or manage your listings."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-700">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={submitHandler} className="space-y-5">
        <RoleToggle value={input.role} onChange={changeEventHandler} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={input.email}
            onChange={changeEventHandler}
            name="email"
            id="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={input.password}
            onChange={changeEventHandler}
            name="password"
            id="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Please wait
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
