import { useState, useEffect } from 'react';
import JobDescriptionPanel from './components/JobDescriptionPanel';
import ResumeUpload from './components/ResumeUpload';
import ResultsDashboard from './components/ResultsDashboard';

// Main application shell coordinating sidebar layout, JD selection, and dashboard panels
function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [resultsCache, setResultsCache] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleCacheUpdate = (jobId, data) => {
    setResultsCache((prev) => ({ ...prev, [jobId]: data }));
  };

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
    fetchJobs();
  }, []);

  const handleJobCreated = (newJob) => {
    setJobs((prevJobs) => [newJob, ...prevJobs]);
    setSelectedJobId(newJob.id);
  };

  const handleDeleteJob = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/jobs/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || data.error || 'Failed to delete job description.');
      }
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
      setResultsCache((prev) => {
        const newCache = { ...prev };
        delete newCache[deleteTarget.id];
        return newCache;
      });
      if (selectedJobId === deleteTarget.id) {
        setSelectedJobId(null);
      }
    } catch (err) {
      console.error('Delete failed:', err.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
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
                    className={`px-6 py-3.5 cursor-pointer transition-all border-l-4 flex items-start justify-between gap-2 ${
                      selectedJobId === job.id
                        ? 'bg-amber-50/45 border-amber-600 text-amber-900 font-semibold'
                        : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm truncate capitalize flex items-center gap-1.5 ${selectedJobId === job.id ? 'font-bold text-stone-900' : 'text-stone-700'}`}>
                        {selectedJobId === job.id && <span className="w-1.5 h-1.5 rounded-full bg-amber-650 inline-block flex-shrink-0"></span>}
                        {job.title}
                      </h3>
                      <span className="text-[11px] text-stone-500 block mt-0.5 font-medium">
                        {job.candidateCount || 0} candidate{job.candidateCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        {new Date(job.created_at || job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(job);
                      }}
                      className="mt-0.5 p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                      title={`Delete ${job.title}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden h-full">
        <header className="border-b border-stone-200 bg-white px-8 py-5 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 capitalize">
              {selectedJobId === null ? 'Create Job Position' : selectedJob?.title}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">
              {selectedJobId === null 
                ? 'Add role parameters to match candidates' 
                : `Screening ${selectedJob?.candidateCount || 0} candidate${selectedJob?.candidateCount !== 1 ? 's' : ''} • Ranked by AI Match Score`
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
                  setResultsCache((prev) => {
                    const newCache = { ...prev };
                    delete newCache[selectedJobId];
                    return newCache;
                  });
                  fetchJobs();
                  window.dispatchEvent(new CustomEvent('resume-uploaded'));
                }}
              />
              <ResultsDashboard 
                jobId={selectedJobId} 
                resultsCache={resultsCache}
                onCacheUpdate={handleCacheUpdate}
              />
            </div>
          )}
        </div>
      </main>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Delete Job Description</h3>
                <p className="text-xs text-stone-500 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-stone-600">
              Are you sure you want to delete <strong className="text-stone-900">{deleteTarget.title}</strong>? All {deleteTarget.candidateCount || 0} associated screening results will also be permanently removed.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
