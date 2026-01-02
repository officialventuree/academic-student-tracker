import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const UserManagement = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
    assignedClasses: []
  });
  
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
    // In a real app, we would also fetch classes from the backend
    // For now, we'll use mock data
    setClasses([
      { _id: '1', className: '4A', subject: 'Mathematics' },
      { _id: '2', className: '4B', subject: 'Mathematics' },
      { _id: '3', className: '3A', subject: 'Science' },
      { _id: '4', className: '3B', subject: 'Science' },
      { _id: '5', className: '5A', subject: 'English' }
    ]);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/auth/users');
      setUsers(res.data);
    } catch (error) {
      setError('Failed to fetch users: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      assignedClasses: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (editingUser) {
        // Update existing user
        await axios.put(`/api/auth/users/${editingUser._id}`, {
          ...formData,
          password: formData.password || undefined // Don't send password if empty
        });
        setSuccess('User updated successfully!');
      } else {
        // Create new user
        await axios.post('/api/auth/users', formData);
        setSuccess('User created successfully!');
      }
      
      handleClose();
      fetchUsers(); // Refresh the user list
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'teacher',
        assignedClasses: []
      });
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't prefill password for security
      role: user.role,
      assignedClasses: user.assignedClasses
    });
    setOpen(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action deactivates the user account.')) {
      try {
        await axios.delete(`/api/auth/users/${userId}`);
        setSuccess('User deactivated successfully!');
        fetchUsers(); // Refresh the user list
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleOpen = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'teacher',
      assignedClasses: []
    });
    setError('');
    setSuccess('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1565c0' }}>
          User Management
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleOpen}
          sx={{ backgroundColor: '#1565c0' }}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {editingUser ? 'Edit User' : 'Add New User'}
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                name="name"
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              
              <TextField
                fullWidth
                margin="normal"
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              
              <TextField
                fullWidth
                margin="normal"
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!editingUser} // Password not required when editing existing user
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Assigned Classes</InputLabel>
                <Select
                  name="assignedClasses"
                  multiple
                  value={formData.assignedClasses}
                  onChange={handleMultiSelectChange}
                  label="Assigned Classes"
                >
                  {classes.map(cls => (
                    <MenuItem key={cls._id} value={cls.className}>
                      {cls.className} - {cls.subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2, backgroundColor: '#1565c0' }}
                disabled={loading}
              >
                {loading ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update User' : 'Create User')}
              </Button>
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User List
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1565c0' }}>
                    <TableCell sx={{ color: 'white' }}>Name</TableCell>
                    <TableCell sx={{ color: 'white' }}>Email</TableCell>
                    <TableCell sx={{ color: 'white' }}>Role</TableCell>
                    <TableCell sx={{ color: 'white' }}>Classes</TableCell>
                    <TableCell sx={{ color: 'white' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Box 
                          sx={{ 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1,
                            backgroundColor: 
                              user.role === 'admin' ? '#ffebee' : '#e3f2fd',
                            color: 
                              user.role === 'admin' ? '#c62828' : '#1565c0'
                          }}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {user.assignedClasses && user.assignedClasses.length > 0 
                          ? user.assignedClasses.join(', ') 
                          : 'None'}
                      </TableCell>
                      <TableCell>
                        <Box 
                          sx={{ 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1,
                            backgroundColor: 
                              user.isActive ? '#e8f5e9' : '#ffebee',
                            color: 
                              user.isActive ? '#2e7d32' : '#c62828'
                          }}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(user)}
                          title="Edit User"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="secondary" 
                          onClick={() => handleDelete(user._id)}
                          title="Delete User"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit User Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Full Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={handleInputChange}
              required={!editingUser}
              helperText={!editingUser ? "Required for new users" : "Leave blank to keep current password"}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleInputChange}
                required
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Assigned Classes</InputLabel>
              <Select
                name="assignedClasses"
                multiple
                value={formData.assignedClasses}
                onChange={handleMultiSelectChange}
                label="Assigned Classes"
              >
                {classes.map(cls => (
                  <MenuItem key={cls._id} value={cls.className}>
                    {cls.className} - {cls.subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">{editingUser ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UserManagement;