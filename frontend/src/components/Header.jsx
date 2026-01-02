import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1565c0' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Academic Student Tracker
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user.role === 'admin' && (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => handleNavigation('/users')}
                  sx={{ 
                    mr: 2,
                    backgroundColor: location.pathname === '/users' ? '#0d47a1' : 'transparent',
                    borderRadius: 1
                  }}
                >
                  User Management
                </Button>
              </>
            )}
            <Typography variant="body1" sx={{ mr: 2 }}>
              Welcome, {user.name} ({user.role})
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;