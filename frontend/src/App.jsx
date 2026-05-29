import { useState, useEffect } from 'react';
import JobDescriptionPanel from './components/JobDescriptionPanel';

// Main application shell managing the workflow routing and global state
function App() {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

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

        {selectedJobId ? (
          <div className="mx-6 p-6 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl text-center">
            <h3 className="text-lg font-bold text-white mb-2">Job Description Selected</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Ready for Phase 2. The resume upload and screening engine features will be connected in the next phase.
            </p>
          </div>
        ) : (
          <div className="mx-6 p-6 bg-slate-800/10 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-sm">
            Please create or select a Job Description to proceed to candidate screening.
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
