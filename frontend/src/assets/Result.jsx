import { useState, useEffect } from 'react';
import axios from "axios";
import Mark from './mark';

export default function Result() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("http://localhost/results");
      if (res.data.success) {
        setData(res.data.data);
        console.log(res.data);
        
      } else {
        setError("Failed to fetch data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err.response?.data?.error || 
        "Failed to fetch data. Please ensure the server is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/data/${id}`);
      // Refresh data after deletion
      fetchData();
      alert("Entry deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete entry");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 90) return "bg-green-100 border-green-400";
    if (score >= 75) return "bg-blue-100 border-blue-400";
    if (score >= 60) return "bg-yellow-100 border-yellow-400";
    return "bg-red-100 border-red-400";
  };

  return (
    <div className="p-8 flex flex-col items-center bg-gray-50 min-h-screen" id="results">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Resume Analysis Results</h1>
      
      {/* Pass latest score to Mark component */}
      {data.length > 0 && <Mark latestScore={data[data.length - 1]} />}
      
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading results...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-2xl">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded max-w-2xl text-center">
          <p className="font-semibold text-lg">No results yet</p>
          <p className="mt-2">Upload a resume to see your ATS score and feedback!</p>
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">Total Submissions: {data.length}</p>
            <button 
              onClick={fetchData}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Refresh
            </button>
          </div>

          {data.map((item, index) => (
            <div 
              key={item.id || index} 
              className={`border-2 rounded-lg p-6 shadow-lg bg-white hover:shadow-xl transition ${getScoreBg(item.score)}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
                  <p className="text-gray-600">{item.email}</p>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-bold ${getScoreColor(item.score)}`}>
                    {item.score}
                  </p>
                  <p className="text-sm text-gray-500">ATS Score</p>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div>
                  <p className="font-semibold text-gray-700">Job Description:</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {item.jobdesc.length > 200 
                      ? item.jobdesc.substring(0, 200) + "..." 
                      : item.jobdesc}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Feedback:</p>
                  <p className="text-gray-600 text-sm mt-1">{item.feedback}</p>
                </div>

                {item.filename && (
                  <div>
                    <p className="font-semibold text-gray-700">Resume File:</p>
                    <p className="text-gray-600 text-sm mt-1">{item.filename}</p>
                  </div>
                )}

                {item.timestamp && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
