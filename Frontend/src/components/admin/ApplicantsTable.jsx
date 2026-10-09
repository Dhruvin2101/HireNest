import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import { Check, MoreHorizontal, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import {
  APPLICATION_API_END_POINT,
  STATUS_BADGE_CLASS,
} from "@/utils/Constants.js";
import { updateApplicantStatus } from "@/redux/applicationSlice.js";

const ApplicantsTable = () => {
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);
  const applications = applicants?.applications || [];

  const statusHandler = async (status, applicationId) => {
    try {
      const res = await axios.put(
        `${APPLICATION_API_END_POINT}/status/${applicationId}/update`,
        { status },
        { withCredentials: true },
      );
      if (res.data.success) {
        dispatch(
          updateApplicantStatus({ applicationId, status: res.data.application.status }),
        );
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Could not update status");
    }
  };

  return (
    <div>
      <Table>
        <TableCaption>A list of people who applied for this job</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Applied On</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No one has applied for this job yet
              </TableCell>
            </TableRow>
          ) : (
            applications.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item?.applicant?.fullName || "Deleted user"}</TableCell>
                <TableCell>{item?.applicant?.email || "N/A"}</TableCell>
                <TableCell>{item?.applicant?.phoneNumber || "N/A"}</TableCell>
                <TableCell>
                  {item?.applicant?.profile?.resume ? (
                    <a
                      href={item.applicant.profile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-700 hover:underline"
                    >
                      {item.applicant.profile.resumeOriginalName || "View resume"}
                    </a>
                  ) : (
                    <span className="text-ink-muted">NA</span>
                  )}
                </TableCell>
                <TableCell>{item?.createdAt?.split("T")[0]}</TableCell>
                <TableCell>
                  <Badge className={`capitalize ${STATUS_BADGE_CLASS[item.status] || ""}`}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Popover>
                    <PopoverTrigger className="cursor-pointer" aria-label="Change status">
                      <MoreHorizontal />
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-2">
                      <button
                        type="button"
                        disabled={item.status === "accepted"}
                        onClick={() => statusHandler("accepted", item._id)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-brand-700 hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4" /> Accept
                      </button>
                      <button
                        type="button"
                        disabled={item.status === "rejected"}
                        onClick={() => statusHandler("rejected", item._id)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-ink hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <X className="w-4" /> Reject
                      </button>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicantsTable;
