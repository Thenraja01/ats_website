import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UploadResume from './pages/UploadResume';
import AtsResult from './pages/AtsResult';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadResume />} />
            <Route path="/result/:id" element={<AtsResult />} />
            <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
            <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
