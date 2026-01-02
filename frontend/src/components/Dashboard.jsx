import React, { useState, useEffect, useContext } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Button,
  CardActionArea
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalAssessments: 0,
    totalAssignments: 0
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you would fetch actual stats from the backend
    // For now, we'll use mock data
    setStats({
      totalStudents: 150,
      totalClasses: 8,
      totalAssessments: 45,
      totalAssignments: 32
    });
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#1565c0' }}>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: '#e3f2fd' }}>
            <CardActionArea onClick={() => handleNavigation('/students')}>
              <CardContent>
                <Typography variant="h5" component="div" sx={{ color: '#1565c0' }}>
                  {stats.totalStudents}
                </Typography>
                <Typography variant="h6" sx={{ color: '#1565c0' }}>
                  Total Students
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: '#e8f5e9' }}>
            <CardActionArea onClick={() => handleNavigation('/classes')}>
              <CardContent>
                <Typography variant="h5" component="div" sx={{ color: '#2e7d32' }}>
                  {stats.totalClasses}
                </Typography>
                <Typography variant="h6" sx={{ color: '#2e7d32' }}>
                  Total Classes
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: '#fff3e0' }}>
            <CardActionArea onClick={() => handleNavigation('/assessments')}>
              <CardContent>
                <Typography variant="h5" component="div" sx={{ color: '#ef6c00' }}>
                  {stats.totalAssessments}
                </Typography>
                <Typography variant="h6" sx={{ color: '#ef6c00' }}>
                  Total Assessments
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', backgroundColor: '#fce4ec' }}>
            <CardActionArea onClick={() => handleNavigation('/assignments')}>
              <CardContent>
                <Typography variant="h5" component="div" sx={{ color: '#c2185b' }}>
                  {stats.totalAssignments}
                </Typography>
                <Typography variant="h6" sx={{ color: '#c2185b' }}>
                  Total Assignments
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#1565c0' }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => handleNavigation('/assessments')}
                  sx={{ backgroundColor: '#1565c0' }}
                >
                  Enter Assessment Marks
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => handleNavigation('/attendance')}
                  sx={{ backgroundColor: '#1565c0' }}
                >
                  Mark Attendance
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => handleNavigation('/assignments')}
                  sx={{ backgroundColor: '#1565c0' }}
                >
                  Create Assignment
                </Button>
                {user && user.role === 'admin' && (
                  <Button 
                    variant="contained" 
                    onClick={() => handleNavigation('/users')}
                    sx={{ backgroundColor: '#7b1fa2' }}
                  >
                    Manage Users
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#1565c0' }}>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No recent activity to display.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;