import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code2,
  FolderGit2,
  Brain,
  Zap,
  Target,
  ExternalLink,
  ChevronRight,
  Lightbulb,
  FileCheck2,
} from 'lucide-react';
import { intelligenceAPI } from '../../services/api';
import { getMasterCareerProfile } from '../../services/careerProfileSync';
import PageHeader from '../../components/workspace/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const CURATED_TRACKS = [
  {
    id: 'system-design',
    title: 'System Design & High-Throughput Architecture',
    category: 'Architecture',
    level: 'Intermediate - Advanced',
    estimatedHours: 8,
    summary: 'Master distributed caches, rate-limiting, CAP theorem tradeoffs, and database indexing.',
    lessons: [
      'In-Memory Caching Patterns (Cache-Aside, Write-Through)',
      'API Rate Limiting Algorithms (Token Bucket, Leaky Bucket)',
      'Horizontal Scaling & Microservices Fault Tolerance',
    ],
    recommendedProject: {
      name: 'Distributed Rate Limiter Middleware',
      description: 'Implement a token-bucket rate limiter for FastAPI/Express backed by Redis.',
      deliverable: 'GitHub repo with Docker Compose setup',
    },
  },
  {
    id: 'redis-caching',
    title: 'Redis & Real-Time In-Memory Workflows',
    category: 'Backend & Data',
    level: 'Intermediate',
    estimatedHours: 5,
    summary: 'Deep dive into TTL caching, distributed locking with Redlock, and Pub/Sub queues.',
    lessons: [
      'Redis Core Data Types & Memory Optimizations',
      'Distributed Locking and Preventing Race Conditions',
      'Event-Driven Architectures with Redis Pub/Sub',
    ],
    recommendedProject: {
      name: 'Real-Time Job Queue & Caching Layer',
      description: 'Build a background job dispatcher using Redis Streams with dead-letter queue recovery.',
      deliverable: 'Unit tests + latency benchmark report',
    },
  },
  {
    id: 'api-security',
    title: 'API Security, OAuth2 & Zero-Trust Auth',
    category: 'Security & DevOps',
    level: 'Intermediate',
    estimatedHours: 6,
    summary: 'Modern authentication paradigms, JWT rotation, scopes, and OWASP Top 10 API mitigations.',
    lessons: [
      'Stateless JWT Authentication & Refresh Token Revocation',
      'Role-Based & Attribute-Based Access Control (RBAC/ABAC)',
      'Defending Against Injection & Broken Object Level Auth (BOLA)',
    ],
    recommendedProject: {
      name: 'Zero-Trust Auth & Policy Enforcer',
      description: 'Build an authentication gateway enforcing signed JWTs and rate-limited endpoints.',
      deliverable: 'Security audit checklist + code implementation',
    },
  },
  {
    id: 'docker-cloud',
    title: 'Containerization, Docker & Cloud Deployment',
    category: 'Cloud & DevOps',
    level: 'Beginner - Intermediate',
    estimatedHours: 6,
    summary: 'Containerize multi-service applications, orchestrate local dev with Docker Compose, and CI/CD basics.',
    lessons: [
      'Multi-Stage Docker Builds for Lean Production Images',
      'Container Networking and Persistent Storage Volumes',
      'GitHub Actions Automated Build & Deploy Pipelines',
    ],
    recommendedProject: {
      name: 'Multi-Container Microservices Pipeline',
      description: 'Package frontend, backend API, and database into unified dockerized local stack.',
      deliverable: 'Dockerfile + docker-compose.yml with automated CI',
    },
  },
];

export default function LearningAcademy() {
  const navigate = useNavigate();
  const profile = useMemo(() => getMasterCareerProfile(), []);

  const overview = useQuery({
    queryKey: ['intelligence', 'overview'],
    queryFn: () => intelligenceAPI.overview().then((r) => r.data),
  });

  const targetRole = profile?.personalInfo?.headline || 'Software Engineer';

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="AI Learning Academy"
        description="Targeted curricula generated to close verified skill gaps, complete practical portfolio projects, and accelerate job-readiness."
        icon={GraduationCap}
        actions={
          <Button
            className="bg-[#0084FF] hover:bg-[#0074E0] text-white"
            onClick={() => navigate('/career/advisor')}
          >
            <Sparkles className="size-4" /> Ask AI Tutor
          </Button>
        }
      />

      {/* ── Top Skill Gap Insight Banner ── */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-amber-500/10 via-card to-primary/10 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Zap className="size-3.5" />
              <span>Personalized For: {targetRole}</span>
            </div>
            <h2 className="text-lg font-bold font-heading text-foreground">
              Skill gaps identified from your JD comparisons &amp; resume audits
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Employers screening for {targetRole} look for verified evidence. Completing these practical tracks
              automatically updates your Career Vault and unlocks interview practice questions.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/interviews/questions')}
            className="rounded-xl text-xs font-semibold shrink-0"
          >
            Practice Topic MCQs
            <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* ── Curated Learning Tracks Grid ── */}
      <div className="space-y-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground">
            Recommended Skill-Gap Curricula
          </h3>
          <p className="text-xs text-muted-foreground">
            Structured lessons with hands-on portfolio deliverables
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {CURATED_TRACKS.map((track) => (
            <Card
              key={track.id}
              className="rounded-2xl border-border/80 hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between overflow-hidden"
            >
              <CardHeader className="pb-3 bg-muted/20 border-b border-border/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                      {track.category}
                    </Badge>
                    <CardTitle className="text-base font-bold font-heading mt-2">
                      {track.title}
                    </CardTitle>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground shrink-0">
                    <Clock className="size-3" /> {track.estimatedHours}h
                  </span>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {track.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                {/* Micro-lessons list */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <BookOpen className="size-3.5 text-primary" /> Key Concepts &amp; Lessons:
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {track.lessons.map((lesson, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Practical Portfolio Deliverable */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <FolderGit2 className="size-3.5" />
                    <span>Portfolio Proof: {track.recommendedProject.name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {track.recommendedProject.description}
                  </p>
                  <p className="text-[10px] font-medium text-primary/80 pt-0.5">
                    Deliverable: {track.recommendedProject.deliverable}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/career/advisor?topic=${encodeURIComponent(track.title)}`)}
                    className="text-xs font-semibold rounded-xl"
                  >
                    <Sparkles className="size-3.5 text-primary mr-1" />
                    Ask AI Tutor
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/interviews/questions?search=${encodeURIComponent(track.category.split(' ')[0])}`)}
                    className="text-xs font-semibold rounded-xl bg-[#0084FF] hover:bg-[#0074E0] text-white"
                  >
                    <Code2 className="size-3.5 mr-1" />
                    Practice Drills
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
