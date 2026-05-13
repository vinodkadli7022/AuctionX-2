import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore.js';

export function ProtectedRoute({ children, allowedRoles }) {
  const { accessToken, user } = useAuthStore();

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    if (user.role === 'auctioneer') return <Navigate to="/auctioneer" replace />;
    if (user.role === 'franchise') return <Navigate to={`/franchise/${user.franchiseId}`} replace />;
    return <Navigate to="/spectator" replace />;
  }

  return children;
}
