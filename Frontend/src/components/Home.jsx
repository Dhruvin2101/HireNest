import HeroSection from "./HeroSection.jsx";
import Navbar from "./shared/Navbar.jsx";
import LatestJobs from "./LatestJobs.jsx";
import HowItWorks from "./HowItWorks.jsx";
import Footer from "./Footer.jsx";
import useGetAllJobs from "@/hooks/useGetAllJobs.jsx";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector((store) => store.auth);

  // recruiters have their own dashboard
  if (user?.role === "recruiter") {
    return <Navigate to="/admin/companies" replace />;
  }

  return (
    <div>
      <Navbar />
      <main>
        {/* category chips live inside the hero, under the search box */}
        <HeroSection />
        <LatestJobs />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
