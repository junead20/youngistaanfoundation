import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import MoodCheck from './pages/MoodCheck';
import Activities from './pages/Activities';
import UserLogin from './pages/UserLogin';
import UserSignup from './pages/UserSignup';
import VolunteerLogin from './pages/VolunteerLogin';
import VolunteerSignup from './pages/VolunteerSignup';
import UserDashboard from './pages/UserDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import UserDetailView from './pages/UserDetailView';
import Communities from './pages/Communities';
import Milo from './pages/Milo';
import Layout from './components/Layout';
import './index.css';

const ProtectedRoute = ({ children, role = 'user' }) => {
  const isAuth = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  if (!isAuth) return <Navigate to={role === 'volunteer' ? '/volunteer/login' : '/login'} replace />;
  if (role === 'volunteer' && userRole !== 'volunteer') return <Navigate to="/dashboard/user" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC — no login needed */}
        <Route path="/" element={<Landing />} />
        <Route path="/mood-check" element={<MoodCheck />} />
        <Route path="/activities" element={<Activities />} />

        {/* AUTH PAGES */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/volunteer/login" element={<VolunteerLogin />} />
        <Route path="/volunteer/signup" element={<VolunteerSignup />} />

        {/* PROTECTED — login required */}
        <Route element={<Layout />}>
          <Route path="/dashboard/user" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
          <Route path="/milo" element={<ProtectedRoute><Milo /></ProtectedRoute>} />
          <Route path="/dashboard/volunteer" element={<ProtectedRoute role="volunteer"><VolunteerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/volunteer/user/:id" element={<ProtectedRoute role="volunteer"><UserDetailView /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
