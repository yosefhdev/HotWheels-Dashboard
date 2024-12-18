import { supabase } from '@/db/supabase';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// import Loader2 from './Loader2';
import Loader from './Loader';

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ isGuest }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session || isGuest);
            setIsLoading(false);
        };

        checkAuth();
    }, [isGuest]);

    if (isLoading) {
        // Puedes mostrar un spinner o mensaje de carga aquí
        return <div><Loader /></div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;