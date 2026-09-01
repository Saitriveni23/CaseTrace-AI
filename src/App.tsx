import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, HelpCircle, Users, Map as MapIcon, Route, Download, ChevronRight, Settings, History, BarChart3, Plus, Globe } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

// --- Mock Data & Types ---
const MOCK_EXTRACTED_TEXT = `FIRST INFORMATION REPORT... (Sample Mock Content)`;
const MOCK_QUESTIONS = ["CCTV cameras near incident?", "Make of motorcycle?", "Attacker features?"];
const MOCK_PROFILES = [{ type: 'Victim', name: 'Rahul Sharma', details: 'Adult male' }, { type: 'Suspect', name: 'Unknown', details: 'Black motorcycle' }];
const MOCK_ROADMAP = [{ step: 'Secure CCTV', desc: 'Acquire footage' }, { step: 'Phone Tracking', desc: 'Trace IMEI' }];
const MOCK_LOCATIONS = [{ name: 'Regal Cinema', type: 'Incident Spot', tag: 'tag-red' }, { name: 'Connaught Place P.S.', type: 'Reporting Station', tag: 'tag-green' }];

type AppState = 'upload' | 'processing' | 'results';
type TabState = 'dashboard' | 'history' | 'analytics' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabState>('dashboard');
  const [appState, setAppState] = useState<AppState>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('fir_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedKey = localStorage.getItem('fir_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      startProcessing(e.target.files[0].name);
    }
  };

  const startProcessing = (fileName: string) => {
    setAppState('processing');
    setTimeout(() => setProcessingStep(1), 1000); 
    setTimeout(() => setProcessingStep(2), 2000); 
    setTimeout(() => setProcessingStep(3), 3000); 
    setTimeout(() => {
      setAppState('results');
      const newCase = { id: Date.now(), name: fileName, date: new Date().toLocaleDateString() };
      const newHistory = [newCase, ...history];
      setHistory(newHistory);
      localStorage.setItem('fir_history', JSON.stringify(newHistory));
    }, 4000);
  };

  const handleExportPDF = () => {
    if (!reportRef.current) return;
    const opt = { margin: 0.5, filename: 'FIR_Report.pdf', image: { type: 'jpeg' as const, quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#13131a' }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
    reportRef.current.classList.add('pdf-export-mode');
    html2pdf().set(opt).from(reportRef.current).save().then(() => reportRef.current?.classList.remove('pdf-export-mode'));
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ MOCK_PROFILES, MOCK_LOCATIONS }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "fir_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Type,Details\n" + MOCK_PROFILES.map(e => \`\${e.name},\${e.type},\${e.details}\`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "profiles.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const renderDashboardContent = () => (
    <>
      {appState === 'upload' && (
        <div className="uploader-container animate-fade-in">
          <UploadCloud className="upload-icon animate-pulse" />
          <h2 style={{ marginBottom: '1rem' }}>Upload FIR Document</h2>
          <div className="toggle-group" style={{ justifyContent: 'center' }}>
            <Globe size={18} color="var(--text-secondary)" />
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={translateEnabled} onChange={e => setTranslateEnabled(e.target.checked)} style={{ marginRight: '0.5rem' }} />
              Auto-translate non-English text
            </label>
          </div>
          <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} />
          <button className="btn-primary" onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}>Select File</button>
        </div>
      )}
      
      {appState === 'processing' && (
        <div className="processing-state animate-fade-in">
          <div className="loader-ring"></div>
          <h2 className="processing-text text-gradient">Analyzing Document...</h2>
          <div className="processing-steps">
            <div className={`step ${processingStep >= 0 ? (processingStep > 0 ? 'done' : 'active') : ''}`}>
              <CheckCircle size={20} /> <span>{translateEnabled ? 'Translating and digitizing text' : 'Digitizing text'}</span>
            </div>
            <div className={`step ${processingStep >= 1 ? (processingStep > 1 ? 'done' : 'active') : ''}`}>
              <CheckCircle size={20} /> <span>Extracting entities and profiles</span>
            </div>
            <div className={`step ${processingStep >= 2 ? (processingStep > 2 ? 'done' : 'active') : ''}`}>
              <CheckCircle size={20} /> <span>Generating roadmap</span>
            </div>
          </div>
        </div>
      )}

      {appState === 'results' && (
        <div className="animate-fade-in">
          <div className="results-header">
            <div><h2 className="text-gradient">Analysis Results</h2></div>
            <div className="export-group">
              <button className="btn-secondary" onClick={handleExportCSV} title="Export CSV"><Download size={18} /></button>
              <button className="btn-secondary" onClick={handleExportJSON} title="Export JSON"><FileText size={18} /></button>
              <button className="btn-primary" onClick={handleExportPDF}><Download size={18} /> PDF</button>
            </div>
          </div>
          <div className="results-grid" ref={reportRef}>
             <div className="glass-panel full-width"><div className="card-header"><FileText className="card-icon" /><span className="card-title">Extracted Text</span></div><div className="extracted-text">{MOCK_EXTRACTED_TEXT}</div></div>
             <div className="glass-panel"><div className="card-header"><Users className="card-icon" /><span className="card-title">Profiles</span></div><div>{MOCK_PROFILES.map((p,i) => <div key={i} className="list-item"><div><b>{p.name}</b> ({p.type})<br/><span style={{fontSize:'0.9rem', color:'gray'}}>{p.details}</span></div></div>)}</div></div>
             <div className="glass-panel"><div className="card-header"><Route className="card-icon" /><span className="card-title">Roadmap</span></div><div>{MOCK_ROADMAP.map((r,i) => <div key={i} className="list-item"><div><b>{r.step}</b><br/><span style={{fontSize:'0.9rem', color:'gray'}}>{r.desc}</span></div></div>)}</div></div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
             <button className="btn-secondary" onClick={() => {setAppState('upload'); setProcessingStep(0); setFile(null);}}><Plus size={18} style={{marginRight:'0.5rem', verticalAlign:'middle'}}/>Analyze Another FIR</button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <h2 className="text-gradient">CaseTrace AI</h2>
        </div>
        <nav>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><UploadCloud size={20} /> Dashboard</div>
          <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}><History size={20} /> Case History</div>
          <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><BarChart3 size={20} /> Analytics</div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={20} /> Settings</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && renderDashboardContent()}
        
        {activeTab === 'history' && (
          <div className="glass-panel animate-fade-in">
            <h2>Saved Cases</h2>
            <p style={{color:'gray', marginBottom:'2rem'}}>Your recently analyzed FIR documents.</p>
            {history.length === 0 ? <p>No history found.</p> : 
              history.map(h => (
                <div key={h.id} className="list-item" style={{justifyContent: 'space-between', alignItems:'center'}}>
                  <div><FileText size={16} style={{display:'inline', marginRight:'0.5rem'}}/> <b>{h.name}</b></div>
                  <div style={{color:'gray', fontSize:'0.9rem'}}>{h.date}</div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="glass-panel animate-fade-in" style={{height: '500px'}}>
            <h2>Crime Category Analytics</h2>
            <p style={{color:'gray', marginBottom:'2rem'}}>Aggregated data from your case history.</p>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={[{name: 'Theft', count: 4}, {name: 'Assault', count: 2}, {name: 'Fraud', count: 1}]}>
                <XAxis dataKey="name" stroke="gray" />
                <YAxis stroke="gray" />
                <Tooltip wrapperStyle={{backgroundColor: '#13131a', border:'none'}} />
                <Bar dataKey="count" fill="var(--accent-blue)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-panel animate-fade-in" style={{maxWidth: '600px'}}>
            <h2>Settings</h2>
            <div className="form-group" style={{marginTop:'2rem'}}>
              <label>AI Provider API Key (Gemini / OpenAI)</label>
              <input type="password" placeholder="sk-..." className="form-input" value={apiKey} onChange={e => {setApiKey(e.target.value); localStorage.setItem('fir_api_key', e.target.value);}} />
              <p style={{color:'gray', fontSize:'0.85rem', marginTop:'0.5rem'}}>Leave blank to use simulated mock data. Entering a key will enable live analysis.</p>
            </div>
            <button className="btn-primary">Save Settings</button>
          </div>
        )}
      </main>
    </div>
  );
}
