import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import WorkspaceLayout from './components/layout/WorkspaceLayout';
import { AuroraBackground } from './components/animations/AuroraBackground';
import ThemedToaster from './components/ThemedToaster';
import SmoothScrollProvider from './components/SmoothScrollProvider';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import PwaUpdatePrompt from './components/layout/PwaUpdatePrompt';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UploadResume from './pages/UploadResume';
import AtsResult from './pages/AtsResult';
import Marketing from './pages/Marketing';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Unauthorized from './pages/Unauthorized';
import JdAnalyzer from './pages/JdAnalyzer';
import ResumeBuilder from './pages/ResumeBuilder';
import CareerVault from './pages/CareerVault';
import CareerAdvisor from './pages/CareerAdvisor';
import JobApplications from './pages/JobApplications';
import OnboardingWizard from './pages/OnboardingWizard';

import Dashboard from './pages/workspace/Dashboard';
import ResumeStudio from './pages/workspace/ResumeStudio';
import JDTailor from './pages/workspace/JDTailor';
import InterviewQuestionBank from './pages/workspace/InterviewQuestionBank';
import MockInterview from './pages/workspace/MockInterview';
import InterviewReport from './pages/workspace/InterviewReport';
import InterviewReports from './pages/workspace/InterviewReports';
import InterviewHub from './pages/workspace/InterviewHub';
import AtsAnalyzer from './pages/workspace/AtsAnalyzer';
import ProjectPreparation from './pages/workspace/ProjectPreparation';
import DocumentsPage from './pages/workspace/DocumentsPage';
import SettingsPage from './pages/workspace/SettingsPage';
import CoverLetterPage from './pages/workspace/CoverLetterPage';
import CareerIntelligence from './pages/workspace/CareerIntelligence';

function PublicShell() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="mx-auto w-full max-w-7xl flex-1 px-4 pt-24 pb-12 sm:px-6 lg:px-8"
      >
        <Outlet />
      </motion.main>
      <Footer />
    </>
  );
}

function App() {
  useOnlineStatus();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SmoothScrollProvider>
        <div className="bg-background text-foreground font-sans relative min-h-screen">
          <AuroraBackground />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Routes>
              {/* ── Public (marketing + auth, renders navbar) ────────────── */}
              <Route element={<PublicShell />}>
                <Route path="/" element={<Home />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/marketing" element={<Marketing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/upload" element={<UploadResume />} />
              </Route>

              {/* ── Workspace (authenticated app shell, renders sidebar) ─── */}
              <Route
                element={
                  <ProtectedRoute>
                    <WorkspaceLayout />
                  </ProtectedRoute>
                }
              >
                {/* 1. Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/result/:id" element={<AtsResult />} />

                {/* 2. My Career */}
                <Route path="/profile" element={<CareerVault />} />
                <Route path="/profile/edit" element={<CareerVault />} />
                <Route path="/career-profile" element={<CareerVault />} />
                <Route path="/career/advisor" element={<CareerAdvisor />} />
                <Route path="/career/skills" element={<CareerIntelligence />} />
                <Route path="/career/goals" element={<CareerVault />} />

                {/* 3. Resume */}
                <Route path="/resumes" element={<ResumeStudio />} />
                <Route path="/resumes/new" element={<ResumeBuilder />} />
                <Route path="/resumes/:id" element={<ResumeBuilder />} />
                <Route path="/resumes/analyze" element={<AtsAnalyzer />} />
                <Route path="/resumes/:id/analyze" element={<AtsAnalyzer />} />
                <Route path="/resumes/:id/optimize" element={<JDTailor />} />
                <Route path="/resume-studio" element={<ResumeStudio />} />
                <Route path="/resume-studio/new" element={<ResumeBuilder />} />
                <Route path="/resume-studio/jd-tailor" element={<JDTailor />} />
                <Route path="/resume-studio/:resumeId/edit" element={<ResumeBuilder />} />
                <Route path="/builder" element={<ResumeBuilder />} />
                <Route path="/resume-builder" element={<ResumeBuilder />} />
                <Route path="/ats-analyzer" element={<AtsAnalyzer />} />
                <Route path="/ats" element={<AtsAnalyzer />} />
                <Route path="/ats/:analysisId" element={<AtsResult />} />

                {/* 4. JD Match */}
                <Route path="/jd-match" element={<JdAnalyzer />} />
                <Route path="/jd-match/new" element={<JdAnalyzer />} />
                <Route path="/jd-match/:id" element={<JdAnalyzer />} />
                <Route path="/jd-analyzer" element={<JdAnalyzer />} />
                <Route path="/jd-matcher" element={<JdAnalyzer />} />
                <Route path="/jobs/analyzer" element={<JdAnalyzer />} />

                {/* 5. Applications */}
                <Route path="/applications" element={<JobApplications />} />
                <Route path="/applications/new" element={<JobApplications />} />
                <Route path="/applications/:id" element={<JobApplications />} />

                {/* 6. Interview Hub */}
                <Route path="/interviews" element={<InterviewHub />} />
                <Route path="/interview" element={<InterviewHub />} />
                <Route path="/interview-hub" element={<InterviewHub />} />
                <Route path="/interviews/mock" element={<MockInterview />} />
                <Route path="/interview/mock" element={<MockInterview />} />
                <Route path="/interview/mock/:sessionId" element={<MockInterview />} />
                <Route path="/interviews/questions" element={<InterviewQuestionBank />} />
                <Route path="/interview/questions" element={<InterviewQuestionBank />} />
                <Route path="/interviews/reports" element={<InterviewReports />} />
                <Route path="/interview/reports" element={<InterviewReports />} />
                <Route path="/interviews/reports/:reportId" element={<InterviewReport />} />
                <Route path="/interview/reports/:reportId" element={<InterviewReport />} />
                <Route path="/interview/project" element={<ProjectPreparation />} />

                {/* 7. Career Vault & Documents */}
                <Route path="/vault" element={<CareerVault />} />
                <Route path="/vault/documents" element={<DocumentsPage />} />
                <Route path="/career-vault" element={<CareerVault />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/documents/cover-letter" element={<CoverLetterPage />} />
                <Route path="/cover-letter" element={<CoverLetterPage />} />

                {/* 8. Onboarding & Settings */}
                <Route path="/onboarding" element={<OnboardingWizard />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </div>
          <ThemedToaster />
          <PwaUpdatePrompt />
        </div>
      </SmoothScrollProvider>
    </Router>
  );
}

export default App;