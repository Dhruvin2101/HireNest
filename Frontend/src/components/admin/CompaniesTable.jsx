import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import CompanyLogo from "../shared/CompanyLogo.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import { Edit2, MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CompaniesTable = () => {
  const { companies = [], searchCompanyByText = "" } = useSelector(
    (store) => store.company || {},
  );

  const navigate = useNavigate();

  // derived on render; no extra state/effect needed
  const filterCompany = companies.filter((company) => {
    if (!searchCompanyByText) return true;

    return company?.name
      ?.toLowerCase()
      .includes(searchCompanyByText.toLowerCase());
  });

  return (
    <div>
      <Table>
        <TableCaption>A list of your recent registered Companies</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filterCompany.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No Companies Found
              </TableCell>
            </TableRow>
          ) : (
            filterCompany.map((company) => (
              <TableRow key={company._id}>
                <TableCell>
                  <CompanyLogo company={company} className="h-9 w-9" />
                </TableCell>

                <TableCell>{company?.name}</TableCell>

                <TableCell>{company?.createdAt?.split("T")[0]}</TableCell>

                <TableCell className="text-right cursor-pointer">
                  <Popover>
                    <PopoverTrigger>
                      <MoreHorizontal />
                    </PopoverTrigger>

                    <PopoverContent className="w-32">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={()=> navigate(`/admin/companies/${company._id}`)}>
                        <Edit2 className="w-4" />
                        <span>Edit</span>
                      </div>
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

export default CompaniesTable;
