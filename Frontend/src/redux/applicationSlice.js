import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
  name: "application",
  initialState: {
    // job object (with populated applications -> applicant) for the recruiter's applicants page
    applicants: null,
  },
  reducers: {
    setAllApplicants: (state, action) => {
      state.applicants = action.payload;
    },
    updateApplicantStatus: (state, action) => {
      const { applicationId, status } = action.payload;
      const application = state.applicants?.applications?.find(
        (item) => item._id === applicationId,
      );
      if (application) application.status = status;
    },
  },
});

export const { setAllApplicants, updateApplicantStatus } =
  applicationSlice.actions;
export default applicationSlice.reducer;
