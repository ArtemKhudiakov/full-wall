import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { useLoginMutation, useRegisterMutation } from '../core/store/authSlice';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const isLoading = isLoginLoading || isRegisterLoading;

  const handleAuth = async (mode: 'login' | 'register') => {
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setError('');

    try {
      const authMethod = mode === 'login' ? login : register;
      await authMethod({ email, password }).unwrap();

      onClose();
    } catch (err: any) {
      setError(err.data?.message || err.error || 'Ошибка авторизации');
    }
  };

  return ReactDOM.createPortal(
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          width: 400,
          backgroundColor: 'white',
          p: 4,
          borderRadius: 2,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="h6" mb={2}>
          Авторизация
        </Typography>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
          disabled={isLoading}
        />
        <TextField
          fullWidth
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
          disabled={isLoading}
        />
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleAuth('login')}
            disabled={isLoading}
          >
            {isLoginLoading ? <CircularProgress size={24} /> : 'Вход'}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleAuth('register')}
            disabled={isLoading}
          >
            {isRegisterLoading ? <CircularProgress size={24} /> : 'Регистрация'}
          </Button>
        </Box>
      </Box>
    </Box>,
    document.body
  );
};

export default AuthModal;
