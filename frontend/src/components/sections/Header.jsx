import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  const logDetailMatch = location.pathname.match(/^\/logs\/[a-f0-9]{24}$/i);

  const titles = {
    '/': 'Главная',
    '/logs': 'Логи',
    '/analytics': 'Аналитика',
    '/errors': 'Ошибки',
    '/stands': 'Стенды',
    '/firmware': 'Прошивки',
    '/stats': 'Статистика',
  };

  const title = logDetailMatch ? 'Просмотр лога' : titles[location.pathname] || 'Система управления';

  return (
    <AppBar position="sticky" sx={{ borderRadius: 1, marginBottom: 2, overflow: 'hidden' }}>
      <Toolbar>
        <Typography variant="h6" noWrap>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
