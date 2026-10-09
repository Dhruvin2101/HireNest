import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { Loader2 } from "lucide-react";
import "./App.css";
// Home is the landing page, so it ships in the main bundle; every other page is
// code-split and only downloaded when someone visits it.
import Home from "./components/Home.jsx";
import ProtectedRoute from "./components/shared/ProtectedRoute.jsx";
import ErrorPage from "./components/ErrorPage.jsx";

const Login = lazy(() => import("./components/auth/Login.jsx"));
const Signup = lazy(() => import("./components/auth/Signup.jsx"));
const Jobs = lazy(() => import("./components/Jobs.jsx"));
const Browse = lazy(() => import("./components/Browse.jsx"));
const Profile = lazy(() => import("./components/Profile.jsx"));
const JobDescription = lazy(() => import("./components/JobDescription.jsx"));
const SavedJobs = lazy(() => import("./components/SavedJobs.jsx"));
const NotFound = lazy(() => import("./components/NotFound.jsx"));
const Companies = lazy(() => import("./components/admin/Companies.jsx"));
const CompanyCreate = lazy(() => import("./components/admin/CompanyCreate.jsx"));
const CompanySetup = lazy(() => import("./components/admin/CompanySetup.jsx"));
const AdminJobs = lazy(() => import("./components/admin/AdminJobs.jsx"));
const PostJob = lazy(() => import("./components/admin/PostJob.jsx"));
const Applicants = lazy(() => import("./components/admin/Applicants.jsx"));

const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center text-brand-600">
    <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading page" />
  </div>
);

// Shared wrapper for every page: shows a spinner while a page's code downloads,
// and a friendly error screen if a page crashes.
const RootLayout = () => (
  <Suspense fallback={<PageLoader />}>
    <Outlet />
  </Suspense>
);

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/description/:id",
    element: <JobDescription />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/jobs",
    element: <Jobs />,
  },
  {
    path: "/browse",
    element: <Browse />,
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute allowedRoles={["student"]}>
        <Profile />
      </ProtectedRoute>
    ),
  },

  // Admin k routes idhar se start ->
  {
    path: "/admin/companies",
    element: (
      <ProtectedRoute allowedRoles={["recruiter"]}>
        <Companies />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/create",
    element: (
      <ProtectedRoute allowedRoles={["recruiter"]}>
        <CompanyCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/:id",
    element: (
      <ProtectedRoute allowedRoles={["recruiter"]}>
        <CompanySetup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs",
    element: (
      <ProtectedRoute allowedRoles={["recruiter"]}>
        <AdminJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/create",
    element: (
      <ProtectedRoute allowedRoles={["recruiter"]}>
        <PostJob />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: (
      <ProtectedRoute allowedRoles={["recruiter"]}>
        <Applicants />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/jobs/:id/edit",
    element: (
      <ProtectedRoute allowedRoles={["recruiter"]}>
        <PostJob />
      </ProtectedRoute>
    ),
  },
  {
    path: "/saved-jobs",
    element: (
      <ProtectedRoute allowedRoles={["student"]}>
        <SavedJobs />
      </ProtectedRoute>
    ),
  },

  // anything that didn't match above
  {
    path: "*",
    element: <NotFound />,
  },
];

const appRouter = createBrowserRouter([
  { element: <RootLayout />, errorElement: <ErrorPage />, children: routes },
]);

function App() {
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
}

export default App;
