import { useState, useEffect } from 'react';

// Renders the panel for entering, listing, and selecting Job Descriptions
function JobDescriptionPanel({ onSelectJob, selectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchJobs = () => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/jobs`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to retrieve jobs.');
        }
        return res.json();
      })
      .then((data) => setJobs(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and description.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to save job description.');
        }
        return res.json();
      })
      .then((newJob) => {
        setJobs([newJob, ...jobs]);
        setTitle('');
        setContent('');
        setSuccess(true);
        onSelectJob(newJob.id);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <div className="md:col-span-2 bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Create Job Description</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Role Description & Requirements</label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Paste detailed job requirements, responsibilities, and key technologies..."
            />
          </div>
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-400 rounded-lg text-sm">
              Job description created successfully.
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Job Description'}
          </button>
        </form>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-xl shadow-xl flex flex-col max-h-[500px]">
        <h2 className="text-xl font-bold text-white mb-4">Select Job Description</h2>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {jobs.length === 0 ? (
            <p className="text-slate-400 text-sm">No job descriptions found. Create one to get started.</p>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className={`p-4 rounded-lg cursor-pointer transition border duration-150 ${
                  selectedJobId === job.id
                    ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-600 text-slate-300'
                }`}
              >
                <h3 className="font-semibold text-base mb-1 truncate">{job.title}</h3>
                <p className="text-xs text-slate-500">
                  Created: {new Date(job.created_at || job.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDescriptionPanel;
