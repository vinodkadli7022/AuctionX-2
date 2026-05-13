import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore.js';
import { ProtectedRoute } from './components/ui/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AuctioneerPage from './pages/AuctioneerPage.jsx';
import FranchisePage from './pages/FranchisePage.jsx';
import SpectatorPage from './pages/SpectatorPage.jsx';
import PlayerPoolPage from './pages/PlayerPoolPage.jsx';
import SquadPage from './pages/SquadPage.jsx';

function RootRedirect() {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (user.role === 'auctioneer') return <Navigate to="/auctioneer" replace />;
  if (user.role === 'franchise') return <Navigate to={`/franchise/${user.franchiseId}`} replace />;
  return <Navigate to="/spectator" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/spectator" element={<SpectatorPage />} />

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auctioneer protected */}
        <Route path="/auctioneer" element={
          <ProtectedRoute allowedRoles={['auctioneer']}>
            <AuctioneerPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/players" element={
          <ProtectedRoute allowedRoles={['auctioneer']}>
            <PlayerPoolPage />
          </ProtectedRoute>
        } />

        {/* Franchise protected */}
        <Route path="/franchise/:id" element={
          <ProtectedRoute allowedRoles={['franchise']}>
            <FranchisePage />
          </ProtectedRoute>
        } />
        <Route path="/franchise/:id/squad" element={
          <ProtectedRoute allowedRoles={['franchise', 'auctioneer']}>
            <SquadPage />
          </ProtectedRoute>
        } />

        {/* Squad view (auctioneer can see any squad) */}
        <Route path="/squads" element={
          <ProtectedRoute allowedRoles={['auctioneer', 'franchise']}>
            <SquadPage />
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
