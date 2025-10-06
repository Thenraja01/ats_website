import { useState, useEffect } from "react";

export default function Mark({ latestScore }) {
  const [scoreData, setScoreData] = useState(null);

  useEffect(() => {
    if (latestScore) {
      setScoreData(latestScore);
    }
  }, [latestScore]);

  const getScoreGrade = (score) => {
    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "B+";
    if (score >= 75) return "B";
    if (score >= 70) return "C+";
    if (score >= 60) return "C";
    return "D";
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) {
      return "Excellent! Your resume is highly optimized.";
    } else if (score >= 75) {
      return "Good! Your resume is well-structured.";
    } else if (score >= 60) {
      return "Fair. Consider improving your resume.";
    } else {
      return "Needs work. Please review the suggestions.";
    }
  };

  return (
    <div className="flex flex-col m-8 items-center w-full max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Resume Score</h1>

      {!scoreData ? (
        <div className="bg-blue-50 border-2 border-blue-300 p-8 rounded-lg shadow-md text-center w-full">
          <svg 
            className="mx-auto h-16 w-16 text-blue-400 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <p className="text-gray-600 text-lg">
            No score available yet.
          </p>
          <p className="text-gray-500 mt-2">
            Please upload your resume to get your ATS score.
          </p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-xl w-full border-2 border-gray-200">
          {/* Score Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - scoreData.score / 100)}`}
                  className={getScoreColor(scoreData.score).replace('bg-', 'text-')}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-5xl font-bold text-gray-800">{scoreData.score}</div>
                <div className="text-sm text-gray-500">out of 100</div>
              </div>
            </div>
          </div>

          {/* Grade and Message */}
          <div className="text-center mb-6">
            <div className={`inline-block ${getScoreColor(scoreData.score)} text-white px-6 py-2 rounded-full text-2xl font-bold mb-3`}>
              Grade: {getScoreGrade(scoreData.score)}
            </div>
            <p className="text-xl text-gray-700 font-semibold">
              {getScoreMessage(scoreData.score)}
            </p>
          </div>

          {/* Applicant Details */}
          <div className="border-t pt-6 space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Name:</span>
              <span className="text-gray-600">{scoreData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="text-gray-600">{scoreData.email}</span>
            </div>
            {scoreData.timestamp && (
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Analyzed:</span>
                <span className="text-gray-600">
                  {new Date(scoreData.timestamp).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Feedback */}
          <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
            <p className="font-semibold text-gray-700 mb-2">Feedback:</p>
            <p className="text-gray-600">{scoreData.feedback}</p>
          </div>

          {/* Score Breakdown */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Keywords</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.floor(scoreData.score * 0.9)}%
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Format</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.floor(scoreData.score * 1.05)}%
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded">
              <p className="text-sm text-gray-600">Content</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.floor(scoreData.score * 0.95)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
