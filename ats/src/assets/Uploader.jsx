import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import axios from "axios";

export default function Uploader({ onUploadSuccess }) {
  const [resume, setResume] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    jobdesc: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // File change handler
  const fetchResume = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                         'text/plain'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid resume file (PDF, DOC, DOCX, or TXT)');
        return;
      }
      setResume(file);
      setError(null);
    }
  };

  // Text inputs change handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!resume) {
      setError("Please select a resume file");
      return;
    }
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!formData.jobdesc.trim()) {
      setError("Please enter the job description");
      return;
    }

    // Create form data
    const data = new FormData();
    data.append("file", resume);
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("jobdesc", formData.jobdesc);

    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/upload/",
        data,
        {
          headers: { 
            "Content-Type": "multipart/form-data" 
          },
        }
      );
      console.log(res.data);
      

      // Success handling
      alert("Resume uploaded successfully! Score: " + res.data.data.score);
      console.log("Upload response:", res.data);

      // Call parent callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(res.data.data);
      }

      // Reset form
      setFormData({ name: "", email: "", jobdesc: "" });
      setResume(null);
      // Reset file input
      document.getElementById("resume_file").value = "";

    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.error || 
        "Failed to upload resume. Please ensure the server is running on port 8000."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center bg-blue-900" id="upload">
      <h1 className="font-serif text-2xl font-bold text-white">
        Upload your Resume
      </h1>
      <p className="text-gray-300 p-12 text-2xl text-center font-semibold">
        Upload your resume and a job description to see how well you match.
        Get an instant ATS score and AI-powered tips to improve your chances.
      </p>
      <h1 className="mb-12 text-xl font-semibold bg-blue-950 p-3 text-white rounded">
        Check Your Resume Score in 15 Seconds
      </h1>

      <div className="form flex border-2 p-12 rounded-lg bg-gray-100 border-blue-300 shadow-xl w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Resume File *
            </label>
            <Input
              type="file"
              id="resume_file"
              name="resume_file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={fetchResume}
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Your Name *
            </label>
            <Input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="border p-3 w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Your Email *
            </label>
            <Input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className="border p-3 w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Job Description *
            </label>
            <textarea
              name="jobdesc"
              placeholder="Paste the job description here..."
              value={formData.jobdesc}
              onChange={handleChange}
              className="border p-3 w-full rounded min-h-32"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200"
          >
            {isLoading ? "Uploading..." : "Upload & Analyze"}
          </Button>
        </form>
      </div>

      {resume && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
          <h3 className="text-lg font-bold mb-3 text-gray-800">Selected File:</h3>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-semibold">Name:</span> {resume.name}</p>
            <p><span className="font-semibold">Size:</span> {(resume.size / 1024).toFixed(2)} KB</p>
            <p><span className="font-semibold">Type:</span> {resume.type}</p>
            {formData.jobdesc && (
              <p><span className="font-semibold">Job Role:</span> {formData.jobdesc.substring(0, 50)}...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
