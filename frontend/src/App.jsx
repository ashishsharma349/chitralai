import { useState, useEffect } from 'react';
import JobDescriptionPanel from './components/JobDescriptionPanel';
import ResumeUpload from './components/ResumeUpload';
import ResultsDashboard from './components/ResultsDashboard';

// Main application shell coordinating sidebar layout, JD selection, and dashboard panels
function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const fetchJobs = () => {
    setLoadingJobs(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/jobs`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to retrieve job descriptions.');
        }
        return res.json();
      })
      .then((data) => {
        setJobs(data);
        if (data.length > 0 && selectedJobId === null) {
          setSelectedJobId(data[0].id);
        }
        setLoadingJobs(false);
      })
      .catch(() => {
        setLoadingJobs(false);
      });
  };

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/health`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Health check offline.');
      })
      .then((data) => setHealthStatus(data))
      .catch(() => setHealthStatus(null));

    fetchJobs();
  }, []);

  const handleJobCreated = (newJob) => {
    setJobs((prevJobs) => [newJob, ...prevJobs]);
    setSelectedJobId(newJob.id);
  };

  const handleProUpgrade = () => {
    alert('Not yet implemented');
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-850 flex font-sans overflow-hidden h-screen">
      <aside className="w-80 bg-white border-r border-stone-200 flex flex-col justify-between h-full flex-shrink-0 z-30 shadow-sm">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 border-b border-stone-150 bg-stone-50/50">
            <h1 className="text-lg font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-600 animate-pulse"></span>
              TalentScreen AI
            </h1>
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">CV Ranking Platform</p>
          </div>

          <div className="p-4 border-b border-stone-150">
            <button
              onClick={() => setSelectedJobId(null)}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all border shadow-sm ${
                selectedJobId === null
                  ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New Job
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            <h2 className="px-6 py-2 text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Active Jobs</h2>
            {loadingJobs && jobs.length === 0 ? (
              <div className="px-6 py-4 flex items-center gap-2 text-stone-400 text-xs">
                <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
                Loading positions...
              </div>
            ) : jobs.length === 0 ? (
              <p className="px-6 py-4 text-xs text-stone-400 italic">No job descriptions added yet.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`px-6 py-3.5 cursor-pointer transition-all border-l-4 ${
                      selectedJobId === job.id
                        ? 'bg-amber-50/40 border-amber-600 text-amber-900 font-semibold shadow-inner'
                        : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50/50'
                    }`}
                  >
                    <h3 className="text-sm truncate capitalize">{job.title}</h3>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      {new Date(job.created_at || job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-stone-150 bg-stone-50/50 flex flex-col gap-2">
          <button
            onClick={handleProUpgrade}
            className="w-full bg-stone-850 hover:bg-stone-900 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Upgrade to Pro
          </button>
          <div className="flex items-center justify-between text-[10px] text-stone-500 px-1 mt-1">
            <span>Server status:</span>
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
              healthStatus 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {healthStatus ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden h-full">
        <header className="border-b border-stone-200 bg-white px-8 py-5 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 capitalize">
              {selectedJobId === null ? 'Create Job Position' : selectedJob?.title}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {selectedJobId === null 
                ? 'Add role parameters to match candidates' 
                : `Active screening Workspace • Added: ${new Date(selectedJob?.created_at || selectedJob?.createdAt).toLocaleDateString()}`
              }
            </p>
          </div>
          {selectedJobId !== null && (
            <button 
              onClick={() => setSelectedJobId(null)}
              className="text-xs font-semibold text-stone-500 hover:text-stone-850 hover:bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl transition-all"
            >
              Back to Creation
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto py-8 px-8 space-y-8">
          {selectedJobId === null ? (
            <JobDescriptionPanel
              onSelectJob={setSelectedJobId}
              selectedJobId={selectedJobId}
              onJobCreated={handleJobCreated}
              hideList={true}
            />
          ) : (
            <div className="space-y-8 max-w-5xl mx-auto w-full">
              <ResumeUpload
                jobId={selectedJobId}
                onUploadComplete={() => {
                  window.dispatchEvent(new CustomEvent('resume-uploaded'));
                }}
              />
              <ResultsDashboard jobId={selectedJobId} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
