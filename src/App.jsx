import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import LoginPage from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import CompanyDashboard from './components/CompanyDashboard.jsx';
import InterviewRoom from './components/InterviewRoom';
// import PostJob from './components/PostJob';

// 1. Create a ProtectedRoute wrapper component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* 2. Redirect the root path to login for better UX */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* <Route path="/postJob" element={<PostJob />} /> */}

      {/* 3. Wrap your Dashboard in the ProtectedRoute */}
      <Route path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/company/dashboard"
        element={
          <ProtectedRoute>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/interview/:roomName"
        element={
          <ProtectedRoute>
            <InterviewRoom />
          </ProtectedRoute>
        } />
    </Routes>
  )
}

export default App