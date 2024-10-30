import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from '@/db/supabase'; // Usamos el alias configurado
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { fetchCars } from "./actions/carActions";
import Loader from "./components/Loader";


function App() {
  // eslint-disable-next-line no-unused-vars
  const [session, setSession] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para controlar la carga
  const [isGuest, setIsGuest] = useState(false); // Estado para verificar si es invitado

  useEffect(() => {
    // Función asíncrona para cargar la sesión y los datos
    const initializeApp = async () => {
      // Obtener sesión de Supabase
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      // Cargar coches
      const fetchedCars = await fetchCars();
      setCars(fetchedCars);

      // Terminar la carga
      setLoading(false);
    };

    initializeApp();

    // Escucha los cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Limpia la suscripción al desmontar
    return () => subscription.unsubscribe();
  }, []);

  // Muestra pantalla de carga mientras se carga la información
  if (loading) {
    return <Loader />; // Puedes personalizar esta pantalla de carga
  }

  return (
    <Router>

      <Routes>

        <Route path="/" element={<Login setIsGuest={setIsGuest} />} />
        <Route path="/login" element={<Login setIsGuest={setIsGuest} />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute isGuest={isGuest} />}>
          <Route path="/dashboard" element={<Dashboard carsData={cars} />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>

  );
}

export default App;