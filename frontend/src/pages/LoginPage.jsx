import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuthLoginMutation } from '../api/apiUser';

const LoginPage = ({ setIsAuthenticated }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loginUser] = useAuthLoginMutation();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await loginUser({ login, password }).unwrap();
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        setIsAuthenticated ? setIsAuthenticated(true) : window.location.reload();
      } else {
        setError('Ошибка авторизации');
      }
    } catch (err) {
      setError(err.data?.message || 'Неверный логин или пароль');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h5" fontWeight={600}>
            Вход в систему
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Логин"
            variant="outlined"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            margin="normal"
            InputProps={{
              sx: { borderRadius: '8px' }
            }}
          />
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            InputProps={{
              sx: { borderRadius: '8px' }
            }}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: '8px'
            }}
          >
            Войти
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
