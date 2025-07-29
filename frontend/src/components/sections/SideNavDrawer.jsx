import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Drawer, List, ListItem, Badge, Box, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BuildIcon from '@mui/icons-material/Build';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import { useHasUnviewedErrorsQuery } from '../../api/apiErrorsLogs';

const iconStyle = {
  marginRight: '12px',
  fontSize: '20px',
};

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

const NavItem = ({ to, icon, text, hasNotification }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <ListItem disablePadding>
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

const SideNavDrawer = () => {
  const { data: unviewedData } = useHasUnviewedErrorsQuery();
  const hasUnviewed = unviewedData?.hasUnviewed || false;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <Drawer
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)',
          borderRight: 'none',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <List sx={{ padding: '10px 0', flexGrow: 1 }}>
        <NavItem to="/home" icon={<HomeIcon sx={iconStyle} />} text="Главная" />
        <NavItem to="/logs" icon={<ArticleIcon sx={iconStyle} />} text="Логи" />
        <NavItem to="/errors" icon={<ErrorOutlineIcon sx={iconStyle} />} text="Ошибки" hasNotification={hasUnviewed} />
        <NavItem to="/stands" icon={<BuildIcon sx={iconStyle} />} text="Стенды" />
        <NavItem to="/firmware" icon={<SettingsApplicationsIcon sx={iconStyle} />} text="Прошивки" />
        <NavItem to="/stats" icon={<BarChartIcon sx={iconStyle} />} text="Статистика" />
      </List>
      
      <ListItem disablePadding>
        <Box
            onClick={handleLogout}
            sx={{
            width: '100%',
            cursor: 'pointer',
            ...navItemStyle(false),
            color: '#d32f2f',
            backgroundColor: 'rgba(211, 47, 47, 0.08)',
            '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.25)',
            }
            }}
        >
            <LogoutIcon sx={{ ...iconStyle, color: '#d32f2f' }} />
            <span style={{ flexGrow: 1 }}>Выйти</span>
        </Box>
      </ListItem>
    </Drawer>
  );
};

export default SideNavDrawer;