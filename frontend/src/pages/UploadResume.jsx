import { useState } from 'react';
import { Upload, File, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUploadResume, useAnalyzeResume } from '../hooks/useResume';

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
      
      navigate('/result/123', { state: { result: analysisResult } });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analyze Your Resume</h1>
        <p className="text-slate-400">Upload your resume and the job description to get a detailed ATS score and AI-powered feedback.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">1. Upload Resume (PDF)</h2>
          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-800/50 transition-colors h-64 relative group cursor-pointer">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file ? (
              <>
                <File className="w-12 h-12 text-indigo-400 mb-4" />
                <p className="text-white font-medium text-center truncate w-full px-4">{file.name}</p>
                <p className="text-sm text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Ready to process
                </div>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-500 mb-4 group-hover:text-indigo-400 transition-colors" />
                <p className="text-white font-medium">Click or drag file to upload</p>
                <p className="text-sm text-slate-500 mt-2">Supports PDF, DOCX (Max 5MB)</p>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">2. Job Description</h2>
          <textarea 
            className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
            placeholder="Paste the job description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          ></textarea>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleUpload}
          disabled={!file || !jd || isProcessing}
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 text-white font-semibold text-lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isUploading ? 'Extracting text...' : 'AI is analyzing...'}
            </>
          ) : (
            'Generate ATS Report'
          )}
        </button>
      </div>
    </div>
  );
}
