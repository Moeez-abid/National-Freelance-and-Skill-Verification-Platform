import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchResults from "./components/SearchResults";
import CategoryPage from "./components/CategoryPage";
import ProjectStatus from "./components/ProjectStatus";
import ProjectDetail from "./components/ProjectDetail";
import Notifications from "./components/Notifications";
import ClientDashboard from "./components/ClientDashboard";
import PostAJob from "./components/PostAJob";
import MyJobs from "./components/MyJobs";
import JobDetail from "./components/JobDetail";
import EditJob from "./components/EditJob";
import BidsForJob from "./components/BidsForJob";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchResults />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/project-status" element={<ProjectStatus />} />
        <Route path="/project-detail" element={<ProjectDetail />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/post-a-job" element={<PostAJob />} />
        <Route path="/my-jobs" element={<MyJobs />} />
        <Route path="/job-detail" element={<JobDetail />} />
        <Route path="/edit-job" element={<EditJob />} />
        <Route path="/bids" element={<BidsForJob />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;