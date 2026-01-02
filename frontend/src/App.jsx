import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import ClassList from './components/ClassList';
import AssessmentForm from './components/AssessmentForm';
import AssignmentForm from './components/AssignmentForm';
import AttendanceForm from './components/AttendanceForm';
import ReportGenerator from './components/ReportGenerator';
import UserManagement from './components/UserManagement';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/students" 
              element={
                <PrivateRoute>
                  <StudentList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/classes" 
              element={
                <PrivateRoute>
                  <ClassList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/assessments" 
              element={
                <PrivateRoute>
                  <AssessmentForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/assignments" 
              element={
                <PrivateRoute>
                  <AssignmentForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/attendance" 
              element={
                <PrivateRoute>
                  <AttendanceForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <PrivateRoute>
                  <ReportGenerator />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <PrivateRoute>
                  <UserManagement />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Container>
      </Box>
    </AuthProvider>
  );
}

export default App;