import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/common/Loader';

const roleBasePath = {
  Teacher: '/teacher/dashboard',
  Student: '/student/dashboard',
  Parent: '/parent/dashboard',
};

export default function RoleRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleBasePath[user.role] || '/login'} replace />;
  }

  return children;
}
