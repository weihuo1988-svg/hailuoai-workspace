import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './lib/store';
import { ToastProvider } from './components/ui/toast';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import AdjustPage from './pages/AdjustPage';
import MapPage from './pages/MapPage';
import RewardsPage from './pages/RewardsPage';
import './adventure.css';

export default function AdventureApp() {
  return (
    <AppProvider>
      <ToastProvider>
        <div className="adventure-scope min-h-screen max-w-md mx-auto relative">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/adjust" element={<AdjustPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
          </Routes>
        </div>
      </ToastProvider>
    </AppProvider>
  );
}
