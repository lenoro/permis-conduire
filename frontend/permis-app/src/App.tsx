import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CandidatsPage from './pages/Candidats/CandidatsPage';
import ExamensPage from './pages/Examens/ExamensPage';
import PaiementsPage from './pages/Paiements/PaiementsPage';
import EtatsPage from './pages/Etats/EtatsPage';
import HistoriqueCandidatPage from './pages/Candidats/HistoriqueCandidatPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f7fb' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/candidats" replace />} />
            <Route path="/candidats" element={<CandidatsPage />} />
            <Route path="/examens" element={<ExamensPage />} />
            <Route path="/paiements" element={<PaiementsPage />} />
            <Route path="/candidats/:id/historique" element={<HistoriqueCandidatPage />} />
            <Route path="/etats" element={<EtatsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
