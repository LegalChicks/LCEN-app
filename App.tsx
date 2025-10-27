
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import CommunityPage from './pages/CommunityPage';
import AssistantPage from './pages/AssistantPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import RemindersPage from './pages/RemindersPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import { useAuth } from './contexts/AuthContext';
import MarketplacePage from './pages/MarketplacePage';
import MemberDetailsPage from './pages/MemberDetailsPage';

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen font-sans text-text-dark">
        {user && <Header />}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/assistant/:sessionId?" element={<ProtectedRoute><AssistantPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>} />
            <Route path="/admin/members/:username" element={<ProtectedRoute role="admin"><MemberDetailsPage /></ProtectedRoute>} />
            
            <Route path="/users/:username" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />


            <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
          </Routes>
        </main>
        {user && <Footer />}
      </div>
    </HashRouter>
  );
};

export default App;
