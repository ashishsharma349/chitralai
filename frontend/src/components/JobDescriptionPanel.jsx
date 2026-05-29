import { useState, useEffect } from 'react';

// Renders the panel for entering, listing, and selecting Job Descriptions
function JobDescriptionPanel({ onSelectJob, selectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const extension = droppedFile.name.split('.').pop().toLowerCase();
      if (extension === 'pdf' || extension === 'docx') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Only PDF and DOCX formats are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const extension = selectedFile.name.split('.').pop().toLowerCase();
      if (extension === 'pdf' || extension === 'docx') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Only PDF and DOCX formats are supported.');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (activeTab === 'manual') {
      if (!title.trim() || !content.trim()) {
        setError('Please provide both a title and description.');
        return;
      }
      setLoading(true);
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
            return res.json().then((data) => {
              throw new Error(data.error || 'Failed to save job description.');
            });
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
    } else {
      if (!file) {
        setError('Please select a JD document to upload.');
        return;
      }
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      if (title.trim()) {
        formData.append('title', title);
      }

      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/jobs`, {
        method: 'POST',
        body: formData,
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error?.message || data.error || 'Failed to parse JD document.');
            });
          }
          return res.json();
        })
        .then((newJob) => {
          setJobs([newJob, ...jobs]);
          setTitle('');
          setFile(null);
          setSuccess(true);
          onSelectJob(newJob.id);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
      <div className="md:col-span-2 bg-white border border-stone-200 p-6 rounded-xl shadow-md flex flex-col justify-between">
        <div>
          <div className="flex border-b border-stone-200 mb-6">
            <button
              onClick={() => {
                setActiveTab('manual');
                setError(null);
                setSuccess(false);
              }}
              className={`pb-3 text-sm font-semibold transition-all duration-150 px-4 ${
                activeTab === 'manual'
                  ? 'border-amber-600 text-amber-700 border-b-2'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Manual Input
            </button>
            <button
              onClick={() => {
                setActiveTab('upload');
                setError(null);
                setSuccess(false);
              }}
              className={`pb-3 text-sm font-semibold transition-all duration-150 px-4 ${
                activeTab === 'upload'
                  ? 'border-amber-600 text-amber-700 border-b-2'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Upload JD Document
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Job Title {activeTab === 'upload' && <span className="text-stone-400 font-normal">(Optional, defaults to filename)</span>}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
                placeholder="e.g. Senior Backend Architect"
              />
            </div>

            {activeTab === 'manual' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Role Description & Requirements
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
                  placeholder="Paste detailed job requirements, responsibilities, and key technologies..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Upload PDF or DOCX Job Description
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-150 ${
                    dragActive
                      ? 'border-amber-500 bg-amber-50/30'
                      : file
                      ? 'border-emerald-400 bg-emerald-50/10'
                      : 'border-stone-300 bg-stone-50 hover:bg-stone-100/50'
                  }`}
                >
                  <input
                    type="file"
                    id="jd-file-upload"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="jd-file-upload" className="cursor-pointer flex flex-col items-center">
                    <svg
                      className={`w-12 h-12 mb-3 transition-colors duration-150 ${
                        file ? 'text-emerald-500' : 'text-stone-400'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {file ? (
                      <div className="text-center">
                        <p className="text-stone-900 font-semibold text-sm">{file.name}</p>
                        <p className="text-stone-500 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB • Click to change</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-stone-700 font-semibold text-sm">Drag and drop file here, or click to browse</p>
                        <p className="text-stone-500 text-xs mt-1">Supports PDF & DOCX up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold">
                Job description created successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 shadow-md"
            >
              {loading ? 'Processing...' : activeTab === 'manual' ? 'Save Job Description' : 'Upload & Parse Document'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white border border-stone-200 p-6 rounded-xl shadow-md flex flex-col max-h-[500px]">
        <h2 className="text-lg font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Select Active Job</h2>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {jobs.length === 0 ? (
            <p className="text-stone-400 text-sm">No job descriptions found. Create or upload one to get started.</p>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => {
                  setError(null);
                  setSuccess(false);
                  onSelectJob(job.id);
                }}
                className={`p-4 rounded-lg cursor-pointer transition border duration-150 ${
                  selectedJobId === job.id
                    ? 'bg-amber-50/50 border-amber-500 text-amber-900 shadow-sm font-semibold'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <h3 className="text-base mb-1 truncate">{job.title}</h3>
                <p className="text-xs text-stone-500">
                  Added: {new Date(job.created_at || job.createdAt).toLocaleDateString()}
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
