import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import { CssBaseline, Drawer, Box, List, ListItem, Badge } from '@mui/material';
import HomePage from './pages/HomePage';
import LogsPage from './pages/LogsPage';
import LogDetails from './components/LogDetails';
import Header from './components/sections/Header';
import LogsErrorsPage from './pages/LogsErrosPage';
import StandsPage from './pages/StandsPage';
import StandDetails from './components/StandDetails';
import StatsPage from './pages/StatsPage';
import { useHasUnviewedErrorsQuery } from './api/apiErrorsLogs';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BuildIcon from '@mui/icons-material/Build';
import BarChartIcon from '@mui/icons-material/BarChart';

function App() {
  // Получаем информацию о наличии непрочитанных ошибок
  const { data: unviewedData } = useHasUnviewedErrorsQuery();
  const hasUnviewed = unviewedData?.hasUnviewed || false;
  
  // Активный элемент меню
  const [activeItem, setActiveItem] = useState(window.location.pathname);

  // Стили для навигационных элементов
  const navItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    margin: '8px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: isActive ? '#fff' : 'rgba(0, 0, 0, 0.87)',
    backgroundColor: isActive ? '#1976d2' : 'transparent',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: isActive ? '#1565c0' : 'rgba(0, 0, 0, 0.04)',
    },
    fontWeight: 500,
    fontSize: '15px',
  });

  // Стиль для иконок
  const iconStyle = {
    marginRight: '12px',
    fontSize: '20px',
  };

  // Компонент для элемента навигации
  const NavItem = ({ to, icon, text, hasNotification }) => {
    const isActive = activeItem === to;
    
    return (
      <ListItem 
        disablePadding
        onClick={() => setActiveItem(to)}
      >
        <NavLink 
          to={to}
          style={{
            width: '100%',
            ...navItemStyle(isActive)
          }}
        >
          {icon}
          <span style={{ flexGrow: 1 }}>{text}</span>
          {hasNotification && (
            <Badge 
              color="error" 
              variant="dot"
              sx={{ 
                '& .MuiBadge-badge': {
                  width: 8,
                  height: 8,
                  minWidth: 'auto',
                }
              }}
            >
              <NotificationsIcon 
                fontSize="small" 
                sx={{ 
                  color: isActive ? '#fff' : '#f44336',
                }}
              />
            </Badge>
          )}
        </NavLink>
      </ListItem>
    );
  };

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Drawer
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)',
              borderRight: 'none',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <List sx={{ padding: '10px 0' }}>
            <NavItem 
              to="/" 
              icon={<HomeIcon sx={iconStyle} />} 
              text="Главная" 
            />
            <NavItem 
              to="/logs" 
              icon={<ArticleIcon sx={iconStyle} />} 
              text="Логи" 
            />
            <NavItem 
              to="/errors" 
              icon={<ErrorOutlineIcon sx={iconStyle} />} 
              text="Ошибки" 
              hasNotification={hasUnviewed}
            />
            <NavItem 
              to="/stands" 
              icon={<BuildIcon sx={iconStyle} />} 
              text="Стенды" 
            />
            <NavItem 
              to="/stats" 
              icon={<BarChartIcon sx={iconStyle} />} 
              text="Статистика" 
            />
          </List>
        </Drawer>
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
            <Route path="/" element={<HomePage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/logs/:logId" element={<LogDetails />} />
            <Route path="/errors" element={<LogsErrorsPage />} />
            <Route path="/stands" element={<StandsPage />} />
            <Route path="/stands/:standId" element={<StandDetails />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;