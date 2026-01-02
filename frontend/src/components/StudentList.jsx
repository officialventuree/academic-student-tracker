import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  Box,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    form: '',
    class: '',
    parentName: '',
    parentContact: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // In a real app, we would make an API call to fetch students
      // For now, we'll use mock data
      const mockStudents = [
        { _id: '1', studentId: 'S001', name: 'Ahmad Ali', form: 'Form 4', class: '4A', parentName: 'Ali bin Abu', parentContact: '012-3456789', admissionDate: '2023-01-15' },
        { _id: '2', studentId: 'S002', name: 'Siti Aminah', form: 'Form 3', class: '3B', parentName: 'Aminah binti Hassan', parentContact: '013-4567890', admissionDate: '2023-01-15' },
        { _id: '3', studentId: 'S003', name: 'Mohd Zain', form: 'Form 5', class: '5C', parentName: 'Zain bin Omar', parentContact: '014-5678901', admissionDate: '2023-01-15' },
        { _id: '4', studentId: 'S004', name: 'Norazlina', form: 'Form 2', class: '2A', parentName: 'Azlina binti Kassim', parentContact: '015-6789012', admissionDate: '2023-01-15' },
        { _id: '5', studentId: 'S005', name: 'Kumar', form: 'Form 4', class: '4B', parentName: 'Raj Kumar', parentContact: '016-7890123', admissionDate: '2023-01-15' }
      ];
      setStudents(mockStudents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      studentId: '',
      name: '',
      form: '',
      class: '',
      parentName: '',
      parentContact: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real app, we would make an API call to create a student
      console.log('Creating student:', formData);
      handleClose();
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1565c0' }}>
          Student Management
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleOpen}
          sx={{ backgroundColor: '#1565c0' }}
        >
          Add Student
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="student table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1565c0' }}>
              <TableCell sx={{ color: 'white' }}>Student ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Form</TableCell>
              <TableCell sx={{ color: 'white' }}>Class</TableCell>
              <TableCell sx={{ color: 'white' }}>Parent Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Parent Contact</TableCell>
              <TableCell sx={{ color: 'white' }}>Admission Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow
                key={student._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {student.studentId}
                </TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.form}</TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell>{student.parentName}</TableCell>
                <TableCell>{student.parentContact}</TableCell>
                <TableCell>{new Date(student.admissionDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    size="small" 
                    sx={{ mr: 1, backgroundColor: '#1976d2' }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small" 
                    sx={{ backgroundColor: '#d32f2f' }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Student Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Student</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="studentId"
              label="Student ID"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.studentId}
              onChange={handleInputChange}
              required
            />
            <TextField
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
            <FormControl fullWidth margin="dense">
              <InputLabel>Form</InputLabel>
              <Select
                name="form"
                value={formData.form}
                label="Form"
                onChange={handleInputChange}
                required
              >
                <MenuItem value="Form 1">Form 1</MenuItem>
                <MenuItem value="Form 2">Form 2</MenuItem>
                <MenuItem value="Form 3">Form 3</MenuItem>
                <MenuItem value="Form 4">Form 4</MenuItem>
                <MenuItem value="Form 5">Form 5</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="class"
              label="Class"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.class}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="parentName"
              label="Parent/Guardian Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.parentName}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="parentContact"
              label="Parent Contact"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.parentContact}
              onChange={handleInputChange}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Add Student</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default StudentList;