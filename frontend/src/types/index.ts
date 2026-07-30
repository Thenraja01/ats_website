export interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'organization_admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ATSResult {
  id: string;
  ats_score: number;
  eligible: boolean;
  missing_skills: string[];
  suggestions: string[];
  interview_questions: string[];
  extracted_skills: string[];
  created_at?: string;
}

export interface AnalysisHistory {
  id: string;
  ats_score: number;
  eligible: boolean;
  missing_skills: string[];
  extracted_skills: string[];
  created_at: string;
}

export interface Stats {
  total_analyses: number;
  avg_score: number;
  max_score: number;
  eligible_count: number;
  eligible_percentage: number;
  last_activity: string | null;
}

export interface JobDescription {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  experience_required?: string;
  education_required?: string;
  responsibilities: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  job_title?: string;
  candidate_id: string;
  candidate_name?: string;
  resume_text: string;
  ats_score: number;
  eligible: boolean;
  analysis_id?: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired';
  created_at: string;
}

export interface Resume {
  id: string;
  original_filename: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  created_at: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface PricingPlan {
  name: string;
  subtitle: string;
  price: string;
  period: string;
  highlight: boolean;
  features: PlanFeature[];
  cta: string;
  ctaLink: string;
}
