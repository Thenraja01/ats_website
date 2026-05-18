import { useState, useEffect } from "react";
import axios from "axios";

export default function Suggest() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Default suggestions
  const defaultSuggestions = [
    {
      title: "Use Clear and Concise Language",
      description: "Avoid jargon and use simple, direct language. ATS systems prefer straightforward content.",
      icon: "📝"
    },
    {
      title: "Highlight Achievements with Numbers",
      description: "Quantify your results (e.g., 'Increased sales by 30%' instead of 'Increased sales').",
      icon: "📊"
    },
    {
      title: "Tailor to Job Description",
      description: "Match keywords from the job posting. Use similar terminology and skills mentioned.",
      icon: "🎯"
    },
    {
      title: "Keep Format Clean and Professional",
      description: "Use standard fonts, clear headings, and avoid complex formatting or graphics.",
      icon: "✨"
    },
    {
      title: "Include Relevant Keywords",
      description: "Incorporate industry-specific terms and skills that ATS systems scan for.",
      icon: "🔑"
    },
    {
      title: "Use Standard Section Headers",
      description: "Use common headers like 'Experience', 'Education', 'Skills' for better ATS parsing.",
      icon: "📑"
    },
    {
      title: "List Skills Explicitly",
      description: "Create a dedicated skills section with relevant technical and soft skills.",
      icon: "💡"
    },
    {
      title: "Avoid Headers and Footers",
      description: "ATS systems may not read information in headers/footers. Keep content in main body.",
      icon: "⚠️"
    }
  ];

  useEffect(() => {
    setSuggestions(defaultSuggestions);
  }, []);

  // Optional: Fetch personalized suggestions from server
  const fetchPersonalizedSuggestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/suggestions");
      if (res.data.success) {
        setSuggestions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      // Keep default suggestions on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center bg-gradient-to-b from-blue-50 to-white min-h-screen" id="suggestions">
      <div className="max-w-6xl w-full">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
          💡 Resume Improvement Tips
        </h1>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Follow these expert suggestions to optimize your resume for ATS systems
        </p>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Loading personalized suggestions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{suggestion.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {suggestion.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Tips Section */}
        <div className="mt-12 bg-blue-600 text-white p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-center">
            🎯 Pro Tips for Maximum ATS Score
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">⏱️</div>
              <h3 className="font-bold mb-2">Keep It Relevant</h3>
              <p className="text-blue-100 text-sm">
                Focus on recent experience and relevant skills for the position
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📄</div>
              <h3 className="font-bold mb-2">Use Standard Format</h3>
              <p className="text-blue-100 text-sm">
                Stick to .PDF or .DOCX formats for best compatibility
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🔄</div>
              <h3 className="font-bold mb-2">Update Regularly</h3>
              <p className="text-blue-100 text-sm">
                Keep your resume current with latest skills and achievements
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-700 mb-4">
            Want personalized suggestions based on your resume?
          </p>
          <button
            onClick={fetchPersonalizedSuggestions}
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Get Personalized Tips"}
          </button>
        </div>
      </div>
    </div>
  );
}
