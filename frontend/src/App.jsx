import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuroraBackground } from './components/animations/AuroraBackground';
import { Toaster } from 'sonner';
import SmoothScrollProvider from './components/SmoothScrollProvider';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UploadResume from './pages/UploadResume';
import AtsResult from './pages/AtsResult';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JobForm from './pages/JobForm';
import Marketing from './pages/Marketing';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/upload" element={<UploadResume />} />
          <Route path="/result/:id" element={<AtsResult />} />
          <Route
            path="/candidate-dashboard"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter-dashboard"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'organization_admin']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['organization_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/new"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'organization_admin']}>
                <JobForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'organization_admin']}>
                <JobForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <SmoothScrollProvider>
        <div className="min-h-screen bg-[#050816] text-white font-sans relative">
          <AuroraBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <AnimatedRoutes />
            <Footer />
          </div>
          <Toaster position="top-right" theme="dark" richColors closeButton />
        </div>
      </SmoothScrollProvider>
    </Router>
  );
}

export default App;
