import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import NgoDashboard from './pages/NgoDashboard';
import CreateCampaign from './pages/CreateCampaign';
import NgoCampaigns from './pages/NgoCampaigns';
import NgoCampaignDetails from './pages/NgoCampaignDetails';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import CampaignDetails from './pages/CampaignDetails';
import NgoDisbursements from './pages/NgoDisbursements';
import DonorDashboard from './pages/DonorDashboard';
import AdminDisbursements from './pages/AdminDisbursements';
import UserProfile from './pages/UserProfile';

import StripeCallback from './pages/StripeCallback';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          <Route path="/ngo/stripe-callback" element={<StripeCallback />} />
          
          {/* Automatically redirect the generic /dashboard to the correct one */}
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />

          {/* Profile Route */}
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['donor', 'ngo', 'admin']}><UserProfile /></ProtectedRoute>} />

          {/* Donor Route */}
          <Route path="/donor/dashboard" element={<ProtectedRoute allowedRoles={['donor']}><DonorDashboard /></ProtectedRoute>} />
          
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
          <Route path="/admin/disbursements" element={<ProtectedRoute allowedRoles={['admin']}><AdminDisbursements /></ProtectedRoute>} />

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

            <Route 
              path="/ngo/campaigns" 
              element={
                <ProtectedRoute allowedRoles={['ngo']}>
                  <NgoCampaigns />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/ngo/campaigns/:id" 
              element={
                <ProtectedRoute allowedRoles={['ngo']}>
                  <NgoCampaignDetails />
                </ProtectedRoute>
              } 
            />

          <Route path="/ngo/disbursements" element={<ProtectedRoute allowedRoles={['ngo']}><NgoDisbursements /></ProtectedRoute>} />
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;