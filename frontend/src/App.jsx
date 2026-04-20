import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import NgoDashboard from './pages/NgoDashboard';
import CreateCampaign from './pages/CreateCampaign';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import CampaignDetails from './pages/CampaignDetails';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          
          {/* Automatically redirect the generic /dashboard to the correct one */}
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />
          
          {/* STRICT ADMIN ROUTE */}
          <Route 
              path="/admin/dashboard" 
              element={
                  <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                  </ProtectedRoute>
              } 
          />

          {/* STRICT NGO ROUTE */}
          <Route 
              path="/ngo/dashboard" 
              element={
                  <ProtectedRoute allowedRoles={['ngo']}>
                      <NgoDashboard />
                  </ProtectedRoute>
              } 
          />

          {/* NEW: NGO CREATE CAMPAIGN ROUTE */}
          <Route 
              path="/ngo/campaigns/create" 
              element={
                  <ProtectedRoute allowedRoles={['ngo']}>
                      <CreateCampaign />
                  </ProtectedRoute>
              } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;