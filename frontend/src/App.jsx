import { useState, useEffect } from 'react';

// Main application component containing the primary interface shell
function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/health`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setHealthStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      background: '#0f172a',
      color: '#f1f5f9',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
      padding: '20px'
    }}>
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 20px 0', fontSize: '24px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
          Resume Screening Application
        </h1>
        <p style={{ margin: '0 0 10px 0', color: '#94a3b8' }}>Foundation Phase Health Check</p>
        
        {loading && <p style={{ color: '#38bdf8' }}>Connecting to backend...</p>}
        
        {error && (
          <div style={{ background: '#451a03', border: '1px solid #78350f', padding: '12px', borderRadius: '6px', color: '#fdba74' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Backend Connection Failed</p>
            <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
          </div>
        )}

        {healthStatus && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0' }}>
              <span>Server Status:</span>
              <span style={{
                background: healthStatus.services.server === 'OK' ? '#064e3b' : '#7f1d1d',
                color: healthStatus.services.server === 'OK' ? '#34d399' : '#f87171',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>{healthStatus.services.server}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0' }}>
              <span>MySQL Database:</span>
              <span style={{
                background: healthStatus.services.database === 'OK' ? '#064e3b' : '#7f1d1d',
                color: healthStatus.services.database === 'OK' ? '#34d399' : '#f87171',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>{healthStatus.services.database}</span>
            </div>
            <p style={{ margin: '20px 0 0 0', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
              Checked: {new Date(healthStatus.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
