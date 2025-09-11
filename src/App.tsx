import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { About } from './pages/About';
import { Team } from './pages/Team';
import { Contact } from './pages/Contact';
import { AIRiskAssessment } from './pages/AIRiskAssessment';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
          <Route path="/ai-assessment" element={<Layout><AIRiskAssessment /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/team" element={<Layout><Team /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
