// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
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

// Компонент для сохранения текущего URL
const AuthenticationChecker = ({ children, isAuthenticated, isLoading }) => {
  const location = useLocation();
  
  // Пока идет проверка токена, показываем loader
  if (isLoading) {
    return <CircleLoader />;
  }
  
  // Если не авторизован, показываем страницу логина, но сохраняем текущий URL
  if (!isAuthenticated) {
    return <LoginPage setIsAuthenticated={() => {}} redirectPath={location.pathname} />;
  }
  
  // Если авторизован, показываем запрашиваемую страницу
  return children;
};

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

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {isAuthenticated && <SideNavDrawer />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            padding: isAuthenticated ? 3 : 0,
          }}
        >
          {isAuthenticated && <Header />}
          <Routes>
            <Route path="/" element={
              loading ? <CircleLoader /> : 
              isAuthenticated ? <Navigate to="/home" /> : 
              <LoginPage setIsAuthenticated={setIsAuthenticated} />
            } />
            
            <Route path="/home" element={
              <AuthenticationChecker isAuthenticated={isAuthenticated} isLoading={loading}>
                <HomePage />
              </AuthenticationChecker>
            } />
            
            <Route path="/logs" element={
              <AuthenticationChecker isAuthenticated={isAuthenticated} isLoading={loading}>
                <LogsPage />
              </AuthenticationChecker>
            } />
            
            <Route path="/logs/:logId" element={
              <AuthenticationChecker isAuthenticated={isAuthenticated} isLoading={loading}>
                <LogDetails />
              </AuthenticationChecker>
            } />
            
            <Route path="/errors" element={
              <AuthenticationChecker isAuthenticated={isAuthenticated} isLoading={loading}>
                <LogsErrorsPage />
              </AuthenticationChecker>
            } />
            
            <Route path="/stands" element={
              <AuthenticationChecker isAuthenticated={isAuthenticated} isLoading={loading}>
                <StandsPage />
              </AuthenticationChecker>
            } />
            
            <Route path="/stands/:standId" element={
              <AuthenticationChecker isAuthenticated={isAuthenticated} isLoading={loading}>
                <StandDetails />
              </AuthenticationChecker>
            } />
            
            <Route path="/stats" element={
              <AuthenticationChecker isAuthenticated={isAuthenticated} isLoading={loading}>
                <StatsPage />
              </AuthenticationChecker>
            } />
            
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;