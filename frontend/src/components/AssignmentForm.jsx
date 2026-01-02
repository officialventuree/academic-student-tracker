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
  TextareaAutosize
} from '@mui/material';
import axios from 'axios';

const AssignmentForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class: '',
    subject: '',
    dueDate: '',
    totalMarks: 100,
    academicYear: new Date().getFullYear().toString()
  });
  
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch classes from the backend
    // For now, we'll use mock data
    setClasses([
      { _id: '1', className: '4A', subject: 'Mathematics' },
      { _id: '2', className: '3B', subject: 'Science' },
      { _id: '3', className: '5C', subject: 'English' },
      { _id: '4', className: '2A', subject: 'History' },
      { _id: '5', className: '4B', subject: 'Geography' }
    ]);
    
    // Mock assignments data
    setAssignments([
      { _id: '1', title: 'Algebra Homework', className: '4A', subject: 'Mathematics', dueDate: '2024-03-15', totalMarks: 20, submissions: 18 },
      { _id: '2', title: 'Science Project', className: '3B', subject: 'Science', dueDate: '2024-03-20', totalMarks: 30, submissions: 22 },
      { _id: '3', title: 'Essay Writing', className: '5C', subject: 'English', dueDate: '2024-03-25', totalMarks: 25, submissions: 15 }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, we would make an API call to save the assignment
      console.log('Saving assignment:', formData);
      
      // Update the assignments list with the new assignment
      const newAssignment = {
        _id: Date.now().toString(),
        title: formData.title,
        className: classes.find(c => c._id === formData.class)?.className || 'Unknown',
        subject: formData.subject,
        dueDate: formData.dueDate,
        totalMarks: formData.totalMarks,
        submissions: 0
      };
      
      setAssignments(prev => [...prev, newAssignment]);
      setFormData({
        title: '',
        description: '',
        class: '',
        subject: '',
        dueDate: '',
        totalMarks: 100,
        academicYear: new Date().getFullYear().toString()
      });
    } catch (error) {
      console.error('Error saving assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#1565c0', mb: 3 }}>
        Assignment Management
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create New Assignment
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                name="title"
                label="Assignment Title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              
              <TextareaAutosize
                minRows={3}
                placeholder="Assignment Description"
                style={{ width: '100%', padding: '10px', marginTop: '10px', marginBottom: '10px' }}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Class</InputLabel>
                <Select
                  name="class"
                  value={formData.class}
                  label="Class"
                  onChange={handleInputChange}
                  required
                >
                  {classes.map(classItem => (
                    <MenuItem key={classItem._id} value={classItem._id}>
                      {classItem.className} - {classItem.subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                margin="normal"
                name="subject"
                label="Subject"
                type="text"
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
              
              <TextField
                fullWidth
                margin="normal"
                name="dueDate"
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                name="totalMarks"
                label="Total Marks"
                type="number"
                value={formData.totalMarks}
                onChange={handleInputChange}
                required
              />
              
              <TextField
                fullWidth
                margin="normal"
                name="academicYear"
                label="Academic Year"
                type="text"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
              />
              
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2, backgroundColor: '#1565c0' }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Create Assignment'}
              </Button>
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Assignments
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1565c0' }}>
                    <TableCell sx={{ color: 'white' }}>Title</TableCell>
                    <TableCell sx={{ color: 'white' }}>Class</TableCell>
                    <TableCell sx={{ color: 'white' }}>Subject</TableCell>
                    <TableCell sx={{ color: 'white' }}>Due Date</TableCell>
                    <TableCell sx={{ color: 'white' }}>Total Marks</TableCell>
                    <TableCell sx={{ color: 'white' }}>Submissions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map(assignment => (
                    <TableRow key={assignment._id}>
                      <TableCell>{assignment.title}</TableCell>
                      <TableCell>{assignment.className}</TableCell>
                      <TableCell>{assignment.subject}</TableCell>
                      <TableCell>{assignment.dueDate}</TableCell>
                      <TableCell>{assignment.totalMarks}</TableCell>
                      <TableCell>{assignment.submissions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssignmentForm;