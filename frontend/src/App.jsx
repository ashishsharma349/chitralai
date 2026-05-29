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
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 flex flex-col font-sans">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            Resume Screener & Candidate Ranker
          </h1>
          <p className="text-xs text-stone-500">Automated candidate matching and ranking</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">Service Status:</span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border ${
            healthStatus 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {healthStatus ? 'Online' : 'Offline'}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto py-8 space-y-8">
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
          <div className="mx-6 bg-white border border-stone-200 p-6 rounded-xl shadow-md max-w-3xl sm:mx-auto my-6">
            <h3 className="text-lg font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">
              Parsed Candidates ({parsedCandidates.length})
            </h3>
            <div className="space-y-3">
              {parsedCandidates.map((cand, idx) => (
                <div key={idx} className="p-4 bg-stone-50 border border-stone-150 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <h4 className="font-bold text-stone-900 text-base">{cand.name}</h4>
                    <p className="text-sm text-stone-600">{cand.email}</p>
                    {cand.phone && <p className="text-xs text-stone-500 mt-0.5">Phone: {cand.phone}</p>}
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md">
                      Extracted: {cand.textLength} chars
                    </span>
                    <p className="text-xs text-stone-500 mt-2 truncate max-w-[200px] font-mono">{cand.fileName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 py-6 px-6 text-center text-xs text-stone-500 bg-white shadow-inner">
        Resume Screening & Candidate Ranking Application. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
