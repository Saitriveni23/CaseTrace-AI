import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, HelpCircle, Users, Map, Route, Download, ChevronRight } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import './App.css';

// --- Mock Data ---
const MOCK_EXTRACTED_TEXT = `FIRST INFORMATION REPORT
(Under Section 154 Cr.P.C.)
1. District: Central Delhi    P.S.: Connaught Place    Year: 2023    FIR No.: 145/2023
2. Date & Hour of Occurrence: 14-08-2023 at about 21:30 Hrs
3. Type of Information: Written
4. Place of Occurrence: Near Regal Cinema, Connaught Place, New Delhi
5. Complainant Name: Rahul Sharma S/o Suresh Sharma
6. Details of known/suspected/unknown accused: Two unknown persons on a black motorcycle.
7. Brief Description of Offense: Snatching of mobile phone and wallet under threat.

Narrative:
The complainant stated that while he was walking near Regal Cinema after dinner, two individuals on a black motorcycle approached him. The pillion rider threatened him with a sharp object and snatched his iPhone 14 Pro and a brown leather wallet containing Rs. 5000 and his driver's license. They fled towards Janpath.`;

const MOCK_QUESTIONS = [
  "Were there any CCTV cameras near Regal Cinema facing the incident spot?",
  "Can the complainant describe the make or partial license plate of the black motorcycle?",
  "Did the attackers have any distinctive physical features or clothing?",
  "Has the stolen iPhone 14 Pro been tracked using 'Find My'?",
  "Were there any street vendors or bystanders at 21:30 Hrs near the location?"
];

const MOCK_PROFILES = [
  { type: 'Victim', name: 'Rahul Sharma', details: 'Adult male, son of Suresh Sharma. Cooperative, slightly traumatized.' },
  { type: 'Suspect 1', name: 'Unknown (Rider)', details: 'Male, operating a black motorcycle. No helmet description provided.' },
  { type: 'Suspect 2', name: 'Unknown (Pillion)', details: 'Male, armed with a sharp object. Executed the snatching.' }
];

const MOCK_ROADMAP = [
  { step: 'Secure CCTV Footage', desc: 'Acquire footage from Regal Cinema and shops towards Janpath.' },
  { step: 'Phone Tracking', desc: 'Coordinate with Cyber Cell to trace the IMEI number of the iPhone 14 Pro.' },
  { step: 'Witness Inquiry', desc: 'Canvas the area for street vendors or auto drivers present at 21:30.' },
  { step: 'Modus Operandi Check', desc: 'Check records for similar motorcycle snatching incidents in Central Delhi.' }
];

const MOCK_LOCATIONS = [
  { name: 'Regal Cinema, Connaught Place', type: 'Incident Spot', tag: 'tag-red' },
  { name: 'Janpath', type: 'Fleeing Direction', tag: 'tag-yellow' },
  { name: 'Connaught Place P.S.', type: 'Reporting Station', tag: 'tag-green' }
];

type AppState = 'upload' | 'processing' | 'results';

function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      startProcessing();
    }
  };

  const startProcessing = () => {
    setAppState('processing');
    
    // Simulate multi-step AI processing
    setTimeout(() => setProcessingStep(1), 1500); // OCR Extraction
    setTimeout(() => setProcessingStep(2), 3000); // NLP Analysis
    setTimeout(() => setProcessingStep(3), 4500); // Generating Insights
    setTimeout(() => {
      setAppState('results');
    }, 6000);
  };

  const handleExportPDF = () => {
    if (!reportRef.current) return;
    
    const opt = {
      margin:       0.5,
      filename:     'FIR_Analysis_Report.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#13131a' },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Temporarily add a class to adjust styling for PDF if needed
    reportRef.current.classList.add('pdf-export-mode');
    html2pdf().set(opt).from(reportRef.current).save().then(() => {
      reportRef.current?.classList.remove('pdf-export-mode');
    });
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <h1 className="text-gradient">CaseTrace AI</h1>
        <p>Intelligent FIR Analysis & Investigation Support Dashboard</p>
      </header>

      {appState === 'upload' && (
        <main className="animate-fade-in">
          <div className="uploader-container">
            <UploadCloud className="upload-icon animate-pulse" />
            <h2 style={{ marginBottom: '1rem' }}>Upload FIR Document</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Drag and drop an image or PDF of the FIR, or click to browse.
            </p>
            <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} />
            <button className="btn-primary" onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}>
              Select File
            </button>
          </div>
        </main>
      )}

      {appState === 'processing' && (
        <main className="processing-state animate-fade-in">
          <div className="loader-ring"></div>
          <h2 className="processing-text text-gradient">Analyzing FIR Document...</h2>
          <div className="processing-steps">
            <div className={`step ${processingStep >= 0 ? (processingStep > 0 ? 'done' : 'active') : ''}`}>
              <CheckCircle size={20} /> <span>Digitizing and cleaning text (OCR)</span>
            </div>
            <div className={`step ${processingStep >= 1 ? (processingStep > 1 ? 'done' : 'active') : ''}`}>
              <CheckCircle size={20} /> <span>Extracting entities and profiles</span>
            </div>
            <div className={`step ${processingStep >= 2 ? (processingStep > 2 ? 'done' : 'active') : ''}`}>
              <CheckCircle size={20} /> <span>Generating investigative roadmap</span>
            </div>
            <div className={`step ${processingStep >= 3 ? 'active' : ''}`}>
              <CheckCircle size={20} /> <span>Finalizing report</span>
            </div>
          </div>
        </main>
      )}

      {appState === 'results' && (
        <main className="animate-fade-in">
          <div className="results-header">
            <div>
              <h2 className="text-gradient" style={{ fontSize: '2rem' }}>Analysis Results</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Based on: {file?.name || 'FIR_Document.jpg'}</p>
            </div>
            <button className="btn-primary" onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={20} />
              Export PDF
            </button>
          </div>

          <div className="results-grid" ref={reportRef}>
            
            {/* Extracted Text */}
            <div className="glass-panel full-width animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="card-header">
                <FileText className="card-icon" />
                <span className="card-title">Cleaned Extracted Text</span>
              </div>
              <div className="extracted-text">
                {MOCK_EXTRACTED_TEXT}
              </div>
            </div>

            {/* Profiles */}
            <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="card-header">
                <Users className="card-icon" />
                <span className="card-title">Entity Profiles</span>
              </div>
              <div>
                {MOCK_PROFILES.map((profile, idx) => (
                  <div key={idx} className="list-item">
                    <ChevronRight size={20} style={{ color: 'var(--accent-blue)', marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                        {profile.name} <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 400 }}>({profile.type})</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{profile.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="card-header">
                <HelpCircle className="card-icon" />
                <span className="card-title">Investigative Questions</span>
              </div>
              <div>
                {MOCK_QUESTIONS.map((q, idx) => (
                  <div key={idx} className="list-item">
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                      {idx + 1}
                    </div>
                    <div style={{ fontSize: '0.95rem' }}>{q}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="card-header">
                <Route className="card-icon" />
                <span className="card-title">Suggested Roadmap</span>
              </div>
              <div>
                {MOCK_ROADMAP.map((step, idx) => (
                  <div key={idx} className="list-item">
                    <div style={{ width: '2px', background: 'var(--accent-purple)', alignSelf: 'stretch', marginRight: '0.5rem', borderRadius: '2px' }}></div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#e2e8f0' }}>{step.step}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="card-header">
                <Map className="card-icon" />
                <span className="card-title">Key Locations</span>
              </div>
              <div>
                {MOCK_LOCATIONS.map((loc, idx) => (
                  <div key={idx} className="list-item" style={{ alignItems: 'center' }}>
                    <span className={`tag ${loc.tag}`}>{loc.type}</span>
                    <span style={{ fontWeight: 500 }}>{loc.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
             <button className="btn-secondary" onClick={() => setAppState('upload')}>Analyze Another FIR</button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
