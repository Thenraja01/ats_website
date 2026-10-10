import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { logout } from './store/slices/authSlice';
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
import OnboardingWizard from './pages/OnboardingWizard';

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
import CareerDashboard from './pages/workspace/CareerDashboard';
import LearningAcademy from './pages/workspace/LearningAcademy';

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
  const dispatch = useDispatch();

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout());
    };
    window.addEventListener('hiremind:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('hiremind:unauthorized', handleUnauthorized);
  }, [dispatch]);

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

              {/* ── Standalone Onboarding (NO sidebar, NO topbar) ─── */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingWizard />
                  </ProtectedRoute>
                }
              />

              {/* ── Workspace (authenticated app shell, renders sidebar & topbar) ─── */}
              <Route
                element={
                  <ProtectedRoute>
                    <WorkspaceLayout />
                  </ProtectedRoute>
                }
              >
                {/* Command Center */}
                <Route path="/dashboard" element={<CareerDashboard />} />
                <Route path="/result/:id" element={<AtsResult />} />

                {/* 1. Resume Studio & Builder */}
                <Route path="/resume/me" element={<ResumeStudio />} />
                <Route path="/resumes/me" element={<ResumeStudio />} />
                <Route path="/resume" element={<ResumeStudio />} />
                <Route path="/resumes" element={<ResumeStudio />} />
                <Route path="/resume/new" element={<ResumeBuilder />} />
                <Route path="/resumes/new" element={<ResumeBuilder />} />
                <Route path="/resume/:id" element={<ResumeBuilder />} />
                <Route path="/resumes/:id" element={<ResumeBuilder />} />
                <Route path="/resume/builder" element={<ResumeBuilder />} />
                <Route path="/builder" element={<ResumeBuilder />} />
                <Route path="/resume-builder" element={<ResumeBuilder />} />
                <Route path="/resumes/analyze" element={<AtsAnalyzer />} />
                <Route path="/resumes/:id/analyze" element={<AtsAnalyzer />} />
                <Route path="/resumes/:id/optimize" element={<AtsAnalyzer />} />
                <Route path="/resume-studio" element={<ResumeStudio />} />
                <Route path="/resume-studio/new" element={<ResumeBuilder />} />
                <Route path="/resume-studio/jd-tailor" element={<AtsAnalyzer />} />
                <Route path="/resume-studio/:resumeId/edit" element={<ResumeBuilder />} />
                <Route path="/ats-analyzer" element={<AtsAnalyzer />} />
                <Route path="/ats" element={<AtsAnalyzer />} />
                <Route path="/ats/:analysisId" element={<AtsResult />} />

                {/* 2. Job Match & ATS (Unified Single Page) */}
                <Route path="/jd-match" element={<AtsAnalyzer />} />
                <Route path="/jd-match/new" element={<AtsAnalyzer />} />
                <Route path="/jd-match/:id" element={<AtsAnalyzer />} />
                <Route path="/jd-analyzer" element={<AtsAnalyzer />} />
                <Route path="/jd-matcher" element={<AtsAnalyzer />} />
                <Route path="/jd-tailor" element={<AtsAnalyzer />} />

                {/* 3. Interview Coach */}
                <Route path="/interviews" element={<InterviewHub />} />
                <Route path="/interview" element={<InterviewHub />} />
                <Route path="/interviews/mock" element={<InterviewHub />} />
                <Route path="/interview/mock" element={<InterviewHub />} />
                <Route path="/interviews/mock/:sessionId" element={<MockInterview />} />
                <Route path="/interview/mock/:sessionId" element={<MockInterview />} />
                <Route path="/interviews/questions" element={<InterviewQuestionBank />} />
                <Route path="/interview/questions" element={<InterviewQuestionBank />} />
                <Route path="/interviews/reports" element={<InterviewReports />} />
                <Route path="/interview/reports" element={<InterviewReports />} />
                <Route path="/interview/reports/:reportId" element={<InterviewReport />} />
                <Route path="/interview/project" element={<ProjectPreparation />} />

                {/* 4. Portfolio / Career Vault */}
                <Route path="/portfolio" element={<CareerVault />} />
                <Route path="/profile" element={<CareerVault />} />
                <Route path="/profile/edit" element={<CareerVault />} />
                <Route path="/career-profile" element={<CareerVault />} />
                <Route path="/career-vault" element={<CareerVault />} />
                <Route path="/vault" element={<CareerVault />} />
                <Route path="/vault/documents" element={<DocumentsPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/documents/cover-letter" element={<CoverLetterPage />} />
                <Route path="/cover-letter" element={<CoverLetterPage />} />
                <Route path="/career/advisor" element={<CareerAdvisor />} />
                <Route path="/career/skills" element={<CareerIntelligence />} />
                <Route path="/career/goals" element={<CareerVault />} />

                {/* 5. AI Learning Academy */}
                <Route path="/learning" element={<LearningAcademy />} />
                <Route path="/academy" element={<LearningAcademy />} />
                <Route path="/learning-academy" element={<LearningAcademy />} />

                {/* 5. Settings */}
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