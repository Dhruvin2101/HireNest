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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Edit2, Eye, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { JOB_API_END_POINT } from "@/utils/Constants.js";
import { setAllAdminJobs } from "@/redux/jobSlice.js";

const AdminJobsTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [jobToDelete, setJobToDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null); // which row's ⋯ menu is open
  const [deleting, setDeleting] = useState(false);

  const { allAdminJobs = [] } = useSelector((store) => store.job || {});

  const deleteJobHandler = async () => {
    if (!jobToDelete) return;
    try {
      setDeleting(true);
      const res = await axios.delete(
        `${JOB_API_END_POINT}/deleteJob/${jobToDelete._id}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        dispatch(
          setAllAdminJobs(allAdminJobs.filter((job) => job._id !== jobToDelete._id)),
        );
        toast.success(res.data.message);
        setJobToDelete(null);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Could not delete the job");
    } finally {
      setDeleting(false);
    }
  };
  const { searchCompanyByText = "" } = useSelector(
    (store) => store.company || {},
  );

  const filterJobs = allAdminJobs.filter((job) => {
    if (!searchCompanyByText) return true;

    const searchLower = searchCompanyByText.toLowerCase();
    return (
      job?.title?.toLowerCase().includes(searchLower) ||
      job?.company?.name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <Table>
        <TableCaption>A list of your posted Jobs</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Applicants</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filterJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No Jobs Found
              </TableCell>
            </TableRow>
          ) : (
            filterJobs.map((job) => (
              <TableRow key={job._id}>
                <TableCell>{job?.company?.name || "N/A"}</TableCell>

                <TableCell>{job?.title || "N/A"}</TableCell>

                <TableCell>
                  {job?.createdAt ? job.createdAt.split("T")[0] : "N/A"}
                </TableCell>

                <TableCell>{job?.applications?.length || 0}</TableCell>

                <TableCell className="text-right">
                  <Popover
                    open={openMenuId === job._id}
                    onOpenChange={(open) => setOpenMenuId(open ? job._id : null)}
                  >
                    <PopoverTrigger className="cursor-pointer" aria-label="Job actions">
                      <MoreHorizontal />
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-brand-50"
                      >
                        <Eye className="w-4" /> Applicants
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/jobs/${job._id}/edit`)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-brand-50"
                      >
                        <Edit2 className="w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null); // close the menu so it isn't left open behind the dialog
                          setJobToDelete(job);
                        }}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-ink hover:bg-paper"
                      >
                        <Trash2 className="w-4" /> Delete
                      </button>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog
        open={Boolean(jobToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setJobToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this job?</DialogTitle>
            <DialogDescription>
              "{jobToDelete?.title}" will be removed for good, along with all of its
              applications. Students who saved it will no longer see it. This can't be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setJobToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={deleteJobHandler}
              disabled={deleting}
              className="bg-ink hover:bg-brand-950 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJobsTable;
