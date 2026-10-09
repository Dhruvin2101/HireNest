import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/Constants.js";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";

const UpdateProfileDialog = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const [input, setInput] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
    bio: user?.profile?.bio || "",
    skills: user?.profile?.skills?.join(", ") || "",
    file: null,
    profilePhoto: null,
  });

  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  // same limits as the server, checked here so users get instant feedback
  const MAX_SIZE = { file: 5 * 1024 * 1024, profilePhoto: 2 * 1024 * 1024 };

  const fileChangeHandler = (e) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    if (file && file.size > MAX_SIZE[name]) {
      toast.error(`File is too large (max ${MAX_SIZE[name] / 1024 / 1024} MB)`);
      e.target.value = "";
      return;
    }
    setInput({ ...input, [name]: file });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullName", input.fullName);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("bio", input.bio);
    formData.append("skills", input.skills);
    if (input.file) {
      formData.append("file", input.file);
    }
    if (input.profilePhoto) {
      formData.append("profilePhoto", input.profilePhoto);
    }

    try {
      setLoading(true);
      const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        setInput((prev) => ({ ...prev, file: null, profilePhoto: null }));
        setOpen(false); // only close on success, so errors can be fixed in place
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-106.25"
          onInteractOutside={() => setOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
            <DialogDescription>
              Update your profile information here.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitHandler}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="name" className="sm:text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="fullName"
                  onChange={changeEventHandler}
                  value={input.fullName}
                  className="sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="email" className="sm:text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  onChange={changeEventHandler}
                  value={input.email}
                  className="sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="number" className="sm:text-right">
                  Number
                </Label>
                <Input
                  id="number"
                  name="phoneNumber"
                  type="tel"
                  inputMode="tel"
                  pattern="[+]?[0-9 ]{10,18}"
                  title="10-15 digit phone number"
                  required
                  onChange={changeEventHandler}
                  value={input.phoneNumber}
                  className="sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="bio" className="sm:text-right">
                  Bio
                </Label>
                <Input
                  id="bio"
                  onChange={changeEventHandler}
                  name="bio"
                  maxLength={300}
                  value={input.bio}
                  className="sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="skills" className="sm:text-right">
                  Skills
                </Label>
                <Input
                  id="skills"
                  name="skills"
                  onChange={changeEventHandler}
                  value={input.skills}
                  className="sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="file" className="sm:text-right">
                  Resume
                </Label>
                <Input
                  id="file"
                  name="file"
                  onChange={fileChangeHandler}
                  type="file"
                  accept="application/pdf"
                  className="sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="profilePhoto" className="sm:text-right">
                  Photo
                </Label>
                <Input
                  id="profilePhoto"
                  name="profilePhoto"
                  onChange={fileChangeHandler}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sm:col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              {loading ? (
                <Button
                  type="button"
                  disabled
                  className="bg-brand-600 hover:bg-brand-700 text-white w-full sm:w-auto flex justify-center items-center"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button
                  className="bg-brand-600 hover:bg-brand-700 text-white w-full sm:w-auto flex justify-center items-center"
                  type="submit"
                >
                  Update
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateProfileDialog;
