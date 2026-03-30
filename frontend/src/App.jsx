import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ChildrenDashboard from './pages/ChildrenDashboard';
import TeenDashboard from './pages/TeenDashboard';
import Chatbot from './pages/Chatbot';
import Milo from './pages/Milo';
import Communities from './pages/Communities';
import Activities from './pages/Activities';
import VolunteerPortal from './pages/VolunteerPortal';
import Programs from './pages/Programs';
import GeographicInsights from './pages/GeographicInsights';
import ImpactReport from './pages/ImpactReport';
import EarlyDetection from './pages/EarlyDetection';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/children" element={<ChildrenDashboard />} />
          <Route path="/dashboard/teens" element={<TeenDashboard />} />
          <Route path="/milo" element={<Milo />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/volunteer" element={<VolunteerPortal />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/geographic" element={<GeographicInsights />} />
          <Route path="/impact" element={<ImpactReport />} />
          <Route path="/early-detection" element={<EarlyDetection />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
