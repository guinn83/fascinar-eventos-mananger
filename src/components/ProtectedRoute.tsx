import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Layout from './Layout';

const ProtectedRoute: React.FC = () => {
  const { user, loading, initialized } = useAuthStore();

  if (loading || !initialized) {
    // You might want to return a loading spinner here
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;
