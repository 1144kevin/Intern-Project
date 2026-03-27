import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { ReactNode } from 'react';
import { useAuth } from '../../context/authContext';

function ProtectedRoute({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return <Spin size="large" style={{ display: 'block', margin: '3rem auto' }} />;
	}

	if (!user) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	return <>{children}</>;
}

export default ProtectedRoute;
