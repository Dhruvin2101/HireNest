import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { STATUS_BADGE_CLASS } from "@/utils/Constants.js";

const AppliedJobTable = () => {
  // default to [] because older persisted state may not have this key yet
  const { allAppliedJobs = [] } = useSelector((store) => store.job);

  return (
    <div>
      <Table>
        <TableCaption>A list of your applied jobs</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Job Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allAppliedJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                You haven't applied to any job yet.{" "}
                <Link to="/jobs" className="text-brand-600 hover:underline">
                  Browse jobs
                </Link>
              </TableCell>
            </TableRow>
          ) : (
            allAppliedJobs.map((application) => (
              <TableRow key={application._id}>
                <TableCell>{application?.createdAt?.split("T")[0]}</TableCell>
                <TableCell>
                  {application?.job ? (
                    <Link
                      to={`/description/${application.job._id}`}
                      className="hover:underline"
                    >
                      {application.job.title}
                    </Link>
                  ) : (
                    <span className="text-ink-muted">Job removed</span>
                  )}
                </TableCell>
                <TableCell>{application?.job?.company?.name || "N/A"}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    className={`capitalize ${STATUS_BADGE_CLASS[application.status] || ""}`}
                  >
                    {application.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppliedJobTable;
