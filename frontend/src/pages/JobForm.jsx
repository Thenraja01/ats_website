import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Wand2, Plus, X } from 'lucide-react';
import { recruiterAPI } from '../services/api';
import { GlowButton } from '../components/ui/GlassCard';
import { toast } from 'sonner';

export default function JobForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    required_skills: [],
    experience_required: '',
    education_required: '',
    responsibilities: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [respInput, setRespInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !form.required_skills.includes(skillInput.trim())) {
      setForm({ ...form, required_skills: [...form.required_skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const addResponsibility = () => {
    if (respInput.trim()) {
      setForm({ ...form, responsibilities: [...form.responsibilities, respInput.trim()] });
      setRespInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await recruiterAPI.updateJob(id, form);
        toast.success('Job updated successfully');
      } else {
        const res = await recruiterAPI.createJob(form);
        toast.success('Job description created');
        navigate(`/recruiter/jobs/${res.data.id}/applications`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-3xl font-bold text-white font-heading mb-2">
        {isEditing ? 'Edit Job Description' : 'Create Job Description'}
      </h1>
      <p className="text-slate-400 text-sm mb-8">
        {isEditing ? 'Update the job description details.' : 'Fill in the details to create a new job posting.'}
      </p>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Job Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the role, responsibilities, and ideal candidate..."
            rows={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
            required
          />
        </div>

        {/* Required Skills */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Required Skills</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Type a skill and press Enter"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
            />
            <button type="button" onClick={addSkill} className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.required_skills.map(skill => (
              <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm">
                {skill}
                <button type="button" onClick={() => setForm({ ...form, required_skills: form.required_skills.filter(s => s !== skill) })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Experience & Education */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Experience Required</label>
            <input
              type="text"
              value={form.experience_required}
              onChange={e => setForm({ ...form, experience_required: e.target.value })}
              placeholder="e.g. 3-5 years"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Education Required</label>
            <input
              type="text"
              value={form.education_required}
              onChange={e => setForm({ ...form, education_required: e.target.value })}
              placeholder="e.g. Bachelor's in CS"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Responsibilities */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Responsibilities</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={respInput}
              onChange={e => setRespInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
              placeholder="Add a responsibility"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none transition-all text-sm"
            />
            <button type="button" onClick={addResponsibility} className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-1.5">
            {form.responsibilities.map((r, i) => (
              <li key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-sm text-slate-300">
                <span>{r}</span>
                <button type="button" onClick={() => setForm({ ...form, responsibilities: form.responsibilities.filter((_, j) => j !== i) })}>
                  <X className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <GlowButton type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isEditing ? 'Update Job' : 'Create Job'}
          </GlowButton>
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-xl glass text-sm text-slate-400 hover:text-white transition-all">
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}
