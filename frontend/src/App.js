import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import HomePage from './pages/HomePage';
import LogsPage from './pages/LogsPage';
import LogDetails from './components/LogDetails';
import Header from './components/sections/Header';
import LogsErrorsPage from './pages/LogsErrosPage';
import StandsPage from './pages/StandsPage';
import StandDetails from './components/StandDetails';
import StatsPage from './pages/StatsPage';
import { useValidateTokenMutation } from './api/apiUser';
import CircleLoader from './components/common/CircleLoader';
import ProtectedRoute from './components/sections/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SideNavDrawer from './components/sections/SideNavDrawer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validateToken] = useValidateTokenMutation();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Проверяем валидность токена на бэкенде
        const response = await validateToken().unwrap();
        if (response && response.valid) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Ошибка валидации токена:', err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, [validateToken]);

  if (!isAuthenticated) {
    return (
      <Router>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
  }

  if (loading) return <CircleLoader />;

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <SideNavDrawer />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            padding: 3,
          }}
        >
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/logs/:logId" element={<LogDetails />} />
              <Route path="/errors" element={<LogsErrorsPage />} />
              <Route path="/stands" element={<StandsPage />} />
              <Route path="/stands/:standId" element={<StandDetails />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/home" element={<HomePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;