import { useEffect } from 'react';

// Renders a modal displaying full candidate match analysis and scoring breakdown
function CandidateModal({ isOpen, onClose, candidate }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !candidate) {
    return null;
  }

  const { score, skillsMatch = [], skillsMissing = [], experienceRelevance, educationAlignment, rationale } = candidate;
  const candInfo = candidate.candidate || {};
  const resumeInfo = candidate.resume || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] scale-100 transition-transform duration-300"
        role="dialog"
        aria-modal="true"
      >
        <header className="bg-stone-50 border-b border-stone-200 p-6 flex justify-between items-start gap-4">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Candidate Profile</span>
            <h2 className="text-xl font-bold text-stone-900 mt-1 capitalize">{candInfo.name || 'Unknown Candidate'}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-stone-600">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {candInfo.email}
              </span>
              {candInfo.phone && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {candInfo.phone}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-2 font-mono truncate max-w-[400px]">File: {resumeInfo.fileName}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="text-stone-200" strokeWidth="6" fill="transparent" stroke="currentColor" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  className="text-amber-600" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray={176} 
                  strokeDashoffset={176 - (176 * score) / 100} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                />
              </svg>
              <span className="absolute text-lg font-extrabold text-stone-900">{score}</span>
            </div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mt-1">Match Score</span>
          </div>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Matched Skills ({skillsMatch.length})
              </h3>
              {skillsMatch.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {skillsMatch.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize"
                    >
                      {skill.toLowerCase()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic">No matching tech skills detected.</p>
              )}
            </div>

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Missing Skills ({skillsMissing.length})
              </h3>
              {skillsMissing.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {skillsMissing.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize"
                    >
                      {skill.toLowerCase()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic">No missing critical skills identified.</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Experience Relevance</h4>
              <p className="text-stone-700 text-sm leading-relaxed">{experienceRelevance}</p>
            </div>

            <div className="border-b border-stone-100 pb-3">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Education & Background Alignment</h4>
              <p className="text-stone-700 text-sm leading-relaxed">{educationAlignment}</p>
            </div>

            <div className="bg-amber-50/40 border border-amber-200/60 p-5 rounded-2xl">
              <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-widest mb-2">Evaluation Rationale</h4>
              <p className="text-stone-850 text-sm leading-relaxed italic">"{rationale}"</p>
            </div>
          </section>
        </div>

        <footer className="bg-stone-50 border-t border-stone-200 p-4 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-850 hover:bg-stone-900 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            Close Analysis
          </button>
        </footer>
      </div>
    </div>
  );
}

export default CandidateModal;
