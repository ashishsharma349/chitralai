import { useState, useEffect } from 'react';
import JobDescriptionPanel from './components/JobDescriptionPanel';
import ResumeUpload from './components/ResumeUpload';

// Main application shell managing the workflow routing and global state
function App() {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [parsedCandidates, setParsedCandidates] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/health`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Health check offline.');
      })
      .then((data) => setHealthStatus(data))
      .catch(() => setHealthStatus(null));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Resume Screener & Candidate Ranker
          </h1>
          <p className="text-xs text-slate-400">Automated candidate matching and ranking</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Service Status:</span>
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
            healthStatus ? 'bg-emerald-950/60 border border-emerald-500 text-emerald-400' : 'bg-red-950/60 border border-red-500 text-red-400'
          }`}>
            {healthStatus ? 'Online' : 'Offline'}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto py-6 space-y-6">
        <JobDescriptionPanel
          onSelectJob={setSelectedJobId}
          selectedJobId={selectedJobId}
        />

        {selectedJobId && (
          <ResumeUpload
            jobId={selectedJobId}
            onUploadComplete={(results) => setParsedCandidates(results)}
          />
        )}

        {selectedJobId && parsedCandidates.length > 0 && (
          <div className="mx-6 bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-xl shadow-xl max-w-3xl mx-auto my-6">
            <h3 className="text-lg font-bold text-white mb-4">Parsed Candidates ({parsedCandidates.length})</h3>
            <div className="space-y-3">
              {parsedCandidates.map((cand, idx) => (
                <div key={idx} className="p-4 bg-slate-900 border border-slate-850 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <h4 className="font-semibold text-white text-base">{cand.name}</h4>
                    <p className="text-sm text-slate-400">{cand.email}</p>
                    {cand.phone && <p className="text-xs text-slate-500">Phone: {cand.phone}</p>}
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-medium text-indigo-400 bg-indigo-950/60 border border-indigo-900 px-2.5 py-1 rounded-md">
                      Text Extracted: {cand.textLength} chars
                    </span>
                    <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{cand.fileName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-600">
        Resume Screening & Candidate Ranking Application. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
