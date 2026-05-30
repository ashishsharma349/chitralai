import { useState } from 'react';

// Renders the drag-and-drop file upload component for multiple resumes
function ResumeUpload({ jobId, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    validateAndAddFiles(selectedFiles);
  };

  const validateAndAddFiles = (fileList) => {
    const validFiles = [];
    let sizeError = false;
    let typeError = false;

    fileList.forEach((file) => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx');
      
      if (!isPdf && !isDocx) {
        typeError = true;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        sizeError = true;
        return;
      }
      validFiles.push(file);
    });

    if (typeError) {
      setError('Only PDF and DOCX files are allowed.');
    } else if (sizeError) {
      setError('Each file must be smaller than 5MB.');
    } else {
      setError(null);
    }

    setFiles([...files, ...validFiles]);
  };

  const handleUpload = () => {
    if (files.length === 0) {
      setError('Please select at least one resume to upload.');
      return;
    }
    setUploading(true);
    setError(null);
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('jobId', jobId);
    files.forEach((file) => {
      formData.append('resumes', file);
    });

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/screen/upload`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error?.message || data.error || 'Upload failed.');
          });
        }
        return res.json();
      })
      .then((data) => {
        setSuccessMsg(data.message);
        setFiles([]);
        if (onUploadComplete) {
          onUploadComplete(data.results);
        }
        setUploading(false);
      })
      .catch((err) => {
        setError(err.message);
        setUploading(false);
      });
  };

  return (
    <div className="bg-white border border-stone-200 p-6 rounded-xl shadow-md max-w-3xl mx-auto my-8">
      <h2 className="text-lg font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Step 2: Upload Resumes</h2>
      
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          validateAndAddFiles(Array.from(e.dataTransfer.files));
        }}
        className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl p-8 text-center cursor-pointer transition duration-150 bg-stone-50 hover:bg-stone-100/50"
      >
        <input
          type="file"
          id="resume-file-input"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.docx"
        />
        <label htmlFor="resume-file-input" className="cursor-pointer block">
          <svg className="w-12 h-12 text-stone-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-stone-700 font-semibold text-sm mb-1">Drag and drop resumes here, or click to browse</p>
          <p className="text-xs text-stone-500">Supports PDF and DOCX formats (Max 5MB per file)</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">Selected Resumes ({files.length}):</h3>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {files.map((file, index) => (
              <div key={index} className="flex justify-between items-center bg-stone-50 px-4 py-2.5 rounded-lg text-sm border border-stone-200 font-medium">
                <span className="text-stone-800 truncate max-w-md">{file.name}</span>
                <span className="text-xs text-stone-500 font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold">
          {successMsg}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setFiles([])}
          disabled={files.length === 0 || uploading}
          className="flex-1 border border-stone-300 hover:bg-stone-100 text-stone-700 py-2.5 rounded-lg text-sm font-bold transition duration-150 disabled:opacity-30"
        >
          Clear All
        </button>
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="flex-[2] bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg text-sm font-bold transition duration-150 disabled:opacity-50 shadow-md"
        >
          {uploading ? 'Processing & Extracting...' : 'Upload & Parse Resumes'}
        </button>
      </div>
    </div>
  );
}

export default ResumeUpload;
