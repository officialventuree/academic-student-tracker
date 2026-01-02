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

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    className: '',
    form: '',
    subject: '',
    academicYear: '',
    teacher: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      // In a real app, we would make an API call to fetch classes
      // For now, we'll use mock data
      const mockClasses = [
        { _id: '1', className: '4A', form: 'Form 4', subject: 'Mathematics', academicYear: '2024', teacher: 'Teacher 1', studentCount: 25 },
        { _id: '2', className: '3B', form: 'Form 3', subject: 'Science', academicYear: '2024', teacher: 'Teacher 2', studentCount: 22 },
        { _id: '3', className: '5C', form: 'Form 5', subject: 'English', academicYear: '2024', teacher: 'Teacher 3', studentCount: 20 },
        { _id: '4', className: '2A', form: 'Form 2', subject: 'History', academicYear: '2024', teacher: 'Teacher 4', studentCount: 24 },
        { _id: '5', className: '4B', form: 'Form 4', subject: 'Geography', academicYear: '2024', teacher: 'Teacher 5', studentCount: 23 }
      ];
      setClasses(mockClasses);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      className: '',
      form: '',
      subject: '',
      academicYear: '',
      teacher: ''
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
      // In a real app, we would make an API call to create a class
      console.log('Creating class:', formData);
      handleClose();
      fetchClasses(); // Refresh the list
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1565c0' }}>
          Class Management
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleOpen}
          sx={{ backgroundColor: '#1565c0' }}
        >
          Add Class
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="class table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1565c0' }}>
              <TableCell sx={{ color: 'white' }}>Class Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Form</TableCell>
              <TableCell sx={{ color: 'white' }}>Subject</TableCell>
              <TableCell sx={{ color: 'white' }}>Academic Year</TableCell>
              <TableCell sx={{ color: 'white' }}>Teacher</TableCell>
              <TableCell sx={{ color: 'white' }}>Student Count</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((classItem) => (
              <TableRow
                key={classItem._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {classItem.className}
                </TableCell>
                <TableCell>{classItem.form}</TableCell>
                <TableCell>{classItem.subject}</TableCell>
                <TableCell>{classItem.academicYear}</TableCell>
                <TableCell>{classItem.teacher}</TableCell>
                <TableCell>{classItem.studentCount}</TableCell>
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

      {/* Add Class Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Class</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="className"
              label="Class Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.className}
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
              name="subject"
              label="Subject"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.subject}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="academicYear"
              label="Academic Year"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.academicYear}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="teacher"
              label="Teacher"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.teacher}
              onChange={handleInputChange}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Add Class</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ClassList;