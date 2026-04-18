import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import NgoDashboard from './pages/NgoDashboard';
import CreateCampaign from './pages/CreateCampaign';

const Home = () => (
  <div className="p-8 text-center mt-10">
    <h1 className="text-4xl font-bold text-aidwise-blue">AidWise Public Portal</h1>
    <Link to="/login" className="mt-4 inline-block text-blue-600 hover:underline">Go to Login</Link>
  </div>
);

// Placeholder for Admin Dashboard Content
const AdminDashboard = () => (
  <DashboardLayout>
      <h1 className="text-3xl font-bold tracking-tight text-aidwise-text">System Admin Overview</h1>
      <p className="mt-2 text-gray-500">Monitor the entire platform.</p>
  </DashboardLayout>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
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