import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUploadResume, useAnalyzeResume } from '../hooks/useResume';
import RevealOnScroll from '../components/animations/RevealOnScroll';
import GradientText from '../components/animations/GradientText';

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { mutateAsync: uploadResume, isPending: isUploading } = useUploadResume();
  const { mutateAsync: analyzeResume, isPending: isAnalyzing } = useAnalyzeResume();

  const isProcessing = isUploading || isAnalyzing;

  const handleUpload = async () => {
    if (!file || !jd) return;
    setError(null);
    try {
      const uploadRes = await uploadResume(file);
      const resumeText = uploadRes.extracted_text;
      const analysisResult = await analyzeResume({ resumeText, jdText: jd });
      navigate(`/result/${analysisResult.id}`, {
        state: { result: analysisResult },
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2 font-heading">
          <GradientText>Analyze Your Resume</GradientText>
        </h1>
        <p className="text-slate-400">Upload your resume and the job description to get a detailed ATS score and AI-powered feedback.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <RevealOnScroll direction="left">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Upload Resume</h2>
            <motion.div
              className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors h-64 relative group cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center"
                  >
                    <File className="w-12 h-12 text-primary mb-4" />
                    <p className="text-white font-medium text-center truncate w-full px-4">{file.name}</p>
                    <p className="text-sm text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Ready to process
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-slate-500 mb-4 group-hover:text-primary transition-colors" />
                    <p className="text-white font-medium">Click or drag file to upload</p>
                    <p className="text-sm text-slate-500 mt-2">Supports PDF, DOCX (Max 5MB)</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="right">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. Job Description</h2>
            <textarea
              className="w-full h-64 bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none transition-all"
              placeholder="Paste the job description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>
        </RevealOnScroll>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <RevealOnScroll className="mt-8 flex justify-end">
        <motion.button
          onClick={handleUpload}
          disabled={!file || !jd || isProcessing}
          whileHover={!isProcessing ? { scale: 1.03 } : {}}
          whileTap={!isProcessing ? { scale: 0.97 } : {}}
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 text-white font-semibold text-lg"
        >
          {isProcessing ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Loader2 className="w-5 h-5" />
              </motion.div>
              {isUploading ? 'Extracting text...' : 'AI is analyzing...'}
            </>
          ) : (
            'Generate ATS Report'
          )}
        </motion.button>
      </RevealOnScroll>
    </div>
  );
}
