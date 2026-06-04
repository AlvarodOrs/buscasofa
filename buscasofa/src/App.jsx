import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchFuelPrices } from './apis/fuelApiLib';

import Header from './components/Header';
import FuelMap from './components/FuelMap';
import About from './components/About';
import Home from './components/Home';
import StationDetail from './components/StationDetail';
import FuelTable from './components/FuelTable';
import Register from './components/Register';
import Login from './components/Login';
import Footer from './components/Footer';
import Profile from './components/Profile'; // New
import PageNotFound from "./404"; // New

// @ts-ignore
import './App.css';
import { Icon } from 'leaflet';


// Componente principal de la aplicación
// Este componente es el punto de entrada de la aplicación y se encarga de gestionar las rutas y el estado global de la aplicación.
// Utiliza React Router para la navegación entre diferentes componentes y páginas.
// También se encarga de la carga inicial de datos (precios de combustible) y del manejo de errores.
// El componente utiliza el hook useEffect para realizar una llamada a la API de precios de combustible al cargar la aplicación.
// Además, utiliza el hook useState para gestionar el estado de los precios de combustible, el usuario autenticado, el estado de carga y los errores.
// El componente Header se encarga de mostrar la barra de navegación y el estado de autenticación del usuario.
// El componente Routes se encarga de definir las diferentes rutas de la aplicación y los componentes que se renderizan en cada ruta.
// El componente BrowserRouter se encarga de gestionar la navegación entre las diferentes rutas de la aplicación.
function PageFooter({path}) {
  if (path) return <><Footer /></>
}
function AppContent() {
  const [stations, setStations] = useState([]);
  const [user] = useState(() =>
      localStorage.getItem('token') ? JSON.parse(localStorage.getItem('user') || 'null') : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation(); // New -> Quitar 'Cargando...' de las pantallas que no necesiten respuestas de la API
  const neededAPI =
    ["/", "/mapa", "/lista"].includes(location.pathname) ||
     /^\/station\/[^/]+$/.test(location.pathname);
  const neededFooter = !["/mapa", "/about"].includes(location.pathname);
    useEffect(() => {
      fetchFuelPrices()
        .then(data => {
          console.log(data);
          setStations(data.ListaEESSPrecio);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }, []);
  return (
    <>
      <Header user={user?.username} />
      {(neededAPI && loading) && <div className="loading">Cargando...</div>}
      {(neededAPI && error) && <div className="error">Error: {error}</div>}
      {/* Comentado para agilizar proceso de enrutamiento en pags no existentes */}
      {/* {!loading && !error && ( */}
        <Routes>
          <Route path="/"            element={<Home stations={stations} />} />
          <Route path="/about"       element={<About />} />
          <Route path="/registro"    element={<Register />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/mapa"        element={<FuelMap stations={stations} />} />
          <Route path="/lista"       element={<FuelTable stations={stations} />} />
          <Route path="/station/:id" element={<StationDetail stations={stations} user={user} />} />
          <Route path="/perfil"      element={<Profile />} /* New */ /> 
          <Route path="*"            element={<PageNotFound />} /* New */ /> 
        </Routes>
        {/* )} */}
        <PageFooter path={neededFooter} />
    </>
  );
}
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
export default App