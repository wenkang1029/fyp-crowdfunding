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
import NgoDisbursements from './pages/NgoDisbursements';
import DonorDashboard from './pages/DonorDashboard';
import AdminDisbursements from './pages/AdminDisbursements';

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

          {/* Donor Route */}
          <Route path="/donor/dashboard" element={<ProtectedRoute allowedRole="donor"><DonorDashboard /></ProtectedRoute>} />
          
          {/* STRICT ADMIN ROUTE */}
          <Route 
              path="/admin/dashboard" 
              element={
                  <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                  </ProtectedRoute>
              } 
          />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/disbursements" element={<ProtectedRoute allowedRole="admin"><AdminDisbursements /></ProtectedRoute>} />

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

          <Route path="/ngo/disbursements" element={<ProtectedRoute allowedRole="ngo"><NgoDisbursements /></ProtectedRoute>} />
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;