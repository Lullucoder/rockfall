import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SimpleLayout } from './components/SimpleLayout';
import { Landing } from './pages/Landing';
import { UnifiedDashboard } from './components/UnifiedDashboard';
import { About } from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<SimpleLayout><UnifiedDashboard /></SimpleLayout>} />
          <Route path="/about" element={<SimpleLayout><About /></SimpleLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
