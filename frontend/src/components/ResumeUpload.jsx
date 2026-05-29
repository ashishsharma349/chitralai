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
            throw new Error(data.error || 'Upload failed.');
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
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-xl shadow-xl max-w-3xl mx-auto my-6">
      <h2 className="text-xl font-bold text-white mb-4">Step 2: Upload Resumes</h2>
      
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          validateAndAddFiles(Array.from(e.dataTransfer.files));
        }}
        className="border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer transition duration-150 bg-slate-900/40"
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
          <p className="text-slate-300 font-medium mb-1">Drag and drop resumes here, or click to browse</p>
          <p className="text-xs text-slate-500">Supports PDF and DOCX formats (Max 5MB per file)</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Selected Resumes ({files.length}):</h3>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {files.map((file, index) => (
              <div key={index} className="flex justify-between items-center bg-slate-900/60 px-3 py-2 rounded-lg text-sm border border-slate-800">
                <span className="text-slate-300 truncate max-w-md">{file.name}</span>
                <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-900 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-400 rounded-lg text-sm">
          {successMsg}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setFiles([])}
          disabled={files.length === 0 || uploading}
          className="flex-1 border border-slate-700 hover:bg-slate-700/50 text-slate-300 py-2.5 rounded-lg text-sm font-medium transition duration-150 disabled:opacity-30"
        >
          Clear All
        </button>
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition duration-150 disabled:opacity-50"
        >
          {uploading ? 'Processing & Extracting...' : 'Upload & Parse Resumes'}
        </button>
      </div>
    </div>
  );
}

export default ResumeUpload;
