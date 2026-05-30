import { useState, useEffect } from 'react';
import CandidateModal from './CandidateModal';

// Displays a ranked table of screened candidates with search, sort, and CSV export
function ResultsDashboard({ jobId }) {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [refreshToggle, setRefreshToggle] = useState(false);

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshToggle((prev) => !prev);
    };
    window.addEventListener('resume-uploaded', handleRefresh);
    return () => {
      window.removeEventListener('resume-uploaded', handleRefresh);
    };
  }, []);

  useEffect(() => {
    if (!jobId) {
      return;
    }
    setLoading(true);
    setError(null);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/screen/results/${jobId}?search=${encodeURIComponent(search)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to retrieve evaluation results.');
        }
        return res.json();
      })
      .then((data) => {
        setCandidates(data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [jobId, search, refreshToggle]);

  const sortedCandidates = [...candidates].sort((a, b) => {
    return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
  });

  const exportToCSV = () => {
    if (sortedCandidates.length === 0) {
      return;
    }
    const headers = ['Rank', 'Name', 'Email', 'Phone', 'Resume File', 'Match Score', 'Matched Skills', 'Missing Skills', 'Rationale'];
    const rows = sortedCandidates.map((cand, idx) => [
      sortOrder === 'desc' ? idx + 1 : sortedCandidates.length - idx,
      `"${(cand.candidate?.name || 'Unknown').replace(/"/g, '""')}"`,
      `"${(cand.candidate?.email || 'N/A').replace(/"/g, '""')}"`,
      `"${(cand.candidate?.phone || 'N/A').replace(/"/g, '""')}"`,
      `"${(cand.resume?.fileName || 'N/A').replace(/"/g, '""')}"`,
      cand.score,
      `"${(cand.skillsMatch || []).join(', ').replace(/"/g, '""')}"`,
      `"${(cand.skillsMissing || []).join(', ').replace(/"/g, '""')}"`,
      `"${(cand.rationale || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `job_description_${jobId}_candidates.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Screening Dashboard</h2>
          <p className="text-xs text-stone-500 mt-0.5">Ranked list of candidates matching the role description</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={sortedCandidates.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search candidate name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-sm bg-[#FAF8F5]/50 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all placeholder:text-stone-400 text-stone-800"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center border border-stone-200 rounded-xl p-0.5 bg-[#FAF8F5]/50 self-start sm:self-auto">
          <button
            onClick={() => setSortOrder('desc')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortOrder === 'desc' 
                ? 'bg-white text-stone-850 shadow-sm border border-stone-150' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Highest Score
          </button>
          <button
            onClick={() => setSortOrder('asc')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortOrder === 'asc' 
                ? 'bg-white text-stone-850 shadow-sm border border-stone-150' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Lowest Score
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-600/35 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-xs text-stone-500 font-medium">Fetching and compiling candidate match records...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm text-center">
          {error}
        </div>
      ) : sortedCandidates.length === 0 ? (
        <div className="py-12 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-stone-800">No Candidates Evaluated</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-xs">
            {search ? 'No candidate matches the search criteria.' : 'Upload candidate resumes above to parse and view score matches.'}
          </p>
        </div>
      ) : (
        <div className="border border-stone-200 rounded-xl overflow-hidden shadow-inner bg-[#FAF8F5]/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-16">Rank</th>
                  <th className="px-6 py-4">Candidate Details</th>
                  <th className="px-6 py-4 w-40">Match score</th>
                  <th className="px-6 py-4">Core skills matched</th>
                  <th className="px-6 py-4 w-24 text-right">Analysis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {sortedCandidates.map((cand, idx) => {
                  const rank = sortOrder === 'desc' ? idx + 1 : sortedCandidates.length - idx;
                  const skills = cand.skillsMatch || [];
                  return (
                    <tr 
                      key={cand.id} 
                      className="hover:bg-white transition-all cursor-pointer"
                      onClick={() => setSelectedCandidate(cand)}
                    >
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-extrabold border ${
                          rank === 1 
                            ? 'bg-amber-100 border-amber-200 text-amber-900' 
                            : rank === 2
                            ? 'bg-stone-200 border-stone-300 text-stone-800'
                            : rank === 3
                            ? 'bg-orange-50 border-orange-200 text-orange-800'
                            : 'bg-white border-stone-200 text-stone-600'
                        }`}>
                          {rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <h4 className="font-bold text-stone-900 text-base capitalize">{cand.candidate?.name || 'Unknown Candidate'}</h4>
                          <p className="text-xs text-stone-500 mt-0.5 truncate max-w-[220px]">{cand.candidate?.email}</p>
                          <p className="text-[10px] text-stone-400 mt-1 font-mono truncate max-w-[220px]">{cand.resume?.fileName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-stone-200/80 rounded-full h-2 w-24 overflow-hidden border border-stone-250">
                            <div 
                              className={`h-full rounded-full ${
                                cand.score >= 80 
                                  ? 'bg-emerald-600' 
                                  : cand.score >= 50 
                                  ? 'bg-amber-600' 
                                  : 'bg-stone-600'
                              }`} 
                              style={{ width: `${cand.score}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-extrabold ${
                            cand.score >= 80 
                              ? 'text-emerald-700' 
                              : cand.score >= 50 
                              ? 'text-amber-700' 
                              : 'text-stone-700'
                          }`}>
                            {cand.score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {skills.slice(0, 3).map((s, sidx) => (
                              <span key={sidx} className="bg-stone-100 text-stone-700 border border-stone-200/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                {s}
                              </span>
                            ))}
                            {skills.length > 3 && (
                              <span className="text-[10px] text-stone-400 font-bold pl-1 self-center">
                                +{skills.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">None matched</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidate(cand);
                          }}
                          className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCandidate && (
        <CandidateModal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          candidate={selectedCandidate}
        />
      )}
    </div>
  );
}

export default ResultsDashboard;
