import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../core/store';
import { logout } from '../core/store/authSlice';
import AuthModal from './AuthModal';

const AuthStatus: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {isAuthenticated ? (
        <>
          <Typography>
            {user ? `${user.email}` : 'Вы авторизованы'}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleLogout}
          >
            Выход
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => setShowAuthModal(true)}
        >
          Войти
        </Button>
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </Box>
  );
};

export default AuthStatus; 