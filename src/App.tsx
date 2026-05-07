import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import TrackingPage from './pages/TrackingPage';
import AdminDashboard from './pages/AdminDashboard';
import CourierDashboard from './pages/CourierDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/courier" element={<CourierDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
