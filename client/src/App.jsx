import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import BacklogPage from './pages/BacklogPage.jsx';
import GameDetailPage from './pages/GameDetailPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/backlog"
                  element={<ProtectedRoute><BacklogPage /></ProtectedRoute>}
                />
                <Route
                  path="/games/:id"
                  element={<ProtectedRoute><GameDetailPage /></ProtectedRoute>}
                />
                <Route
                  path="/dashboard"
                  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
                />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
