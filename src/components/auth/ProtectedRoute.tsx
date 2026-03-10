import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../ui/Spinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireRoot?: boolean;
}

const ProtectedRoute = ({ children, requireRoot = false }: ProtectedRouteProps) => {
    const { user, isRoot, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Spinner size="lg" className="text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse">Loading required user data...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireRoot && !isRoot) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
