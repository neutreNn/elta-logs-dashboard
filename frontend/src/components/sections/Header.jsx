import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  const titles = {
    '/home': 'Главная',
    '/logs': 'Логи',
    '/analytics': 'Аналитика',
    '/errors': 'Ошибки',
    '/stands': 'Стенды',
    '/firmware': 'Прошивки',
    '/mobile': 'Приложения',
    '/stats': 'Статистика',
  };

  const dynamicRoutes = [
    { regex: /^\/logs\/[a-f0-9]{24}$/i, title: 'Просмотр лога' },
    { regex: /^\/firmware\/[a-f0-9]{24}$/i, title: 'Просмотр прошивок' },
    { regex: /^\/mobile\/[a-f0-9]{24}$/i, title: 'Просмотр приложения' },
  ];

  const dynamicMatch = dynamicRoutes.find(route => route.regex.test(location.pathname));

  const title = dynamicMatch
    ? dynamicMatch.title
    : titles[location.pathname];

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
