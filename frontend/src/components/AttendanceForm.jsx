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
  Checkbox,
  FormControlLabel
} from '@mui/material';
import axios from 'axios';

const AttendanceForm = () => {
  const [formData, setFormData] = useState({
    class: '',
    date: new Date().toISOString().split('T')[0],
    academicYear: new Date().getFullYear().toString(),
    term: ''
  });
  
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch classes and students from the backend
    // For now, we'll use mock data
    setClasses([
      { _id: '1', className: '4A', subject: 'Mathematics' },
      { _id: '2', className: '3B', subject: 'Science' },
      { _id: '3', className: '5C', subject: 'English' },
      { _id: '4', className: '2A', subject: 'History' },
      { _id: '5', className: '4B', subject: 'Geography' }
    ]);
    
    // Mock students data for class 4A
    setStudents([
      { _id: '1', name: 'Ahmad Ali', studentId: 'S001', status: 'present' },
      { _id: '2', name: 'Siti Aminah', studentId: 'S002', status: 'present' },
      { _id: '3', name: 'Mohd Zain', studentId: 'S003', status: 'absent' },
      { _id: '4', name: 'Norazlina', studentId: 'S004', status: 'late' },
      { _id: '5', name: 'Kumar', studentId: 'S005', status: 'present' },
      { _id: '6', name: 'Lee Wei', studentId: 'S006', status: 'present' },
      { _id: '7', name: 'Rajesh', studentId: 'S007', status: 'absent' },
      { _id: '8', name: 'Fatimah', studentId: 'S008', status: 'present' }
    ]);
    
    // Mock attendance data
    setAttendanceData([
      { _id: '1', studentName: 'Ahmad Ali', studentId: 'S001', status: 'present', date: '2024-03-15' },
      { _id: '2', studentName: 'Siti Aminah', studentId: 'S002', status: 'present', date: '2024-03-15' },
      { _id: '3', studentName: 'Mohd Zain', studentId: 'S003', status: 'absent', date: '2024-03-15' }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentStatusChange = (studentId, status) => {
    setStudents(prev => 
      prev.map(student => 
        student._id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, we would make an API call to save the attendance
      console.log('Saving attendance:', { ...formData, attendanceData: students });
      
      // Update the attendance list with the new attendance
      const newAttendance = students.map(student => ({
        _id: `${Date.now()}-${student._id}`,
        studentName: student.name,
        studentId: student.studentId,
        status: student.status,
        date: formData.date
      }));
      
      setAttendanceData(prev => [...prev, ...newAttendance]);
      
      // Reset student statuses to default
      setStudents(prev => 
        prev.map(student => ({ ...student, status: 'present' }))
      );
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#1565c0', mb: 3 }}>
        Attendance Management
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Mark Attendance
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
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
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <TextField
                    name="date"
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Term</InputLabel>
                    <Select
                      name="term"
                      value={formData.term}
                      label="Term"
                      onChange={handleInputChange}
                      required
                    >
                      <MenuItem value="Semester 1">Semester 1</MenuItem>
                      <MenuItem value="Semester 2">Semester 2</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <TextField
                    name="academicYear"
                    label="Academic Year"
                    type="text"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 2, backgroundColor: '#1565c0', height: '100%' }}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Attendance'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Students in Class
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1565c0' }}>
                    <TableCell sx={{ color: 'white' }}>Student ID</TableCell>
                    <TableCell sx={{ color: 'white' }}>Name</TableCell>
                    <TableCell sx={{ color: 'white' }}>Present</TableCell>
                    <TableCell sx={{ color: 'white' }}>Absent</TableCell>
                    <TableCell sx={{ color: 'white' }}>Late</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map(student => (
                    <TableRow key={student._id}>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={student.status === 'present'}
                              onChange={() => handleStudentStatusChange(student._id, 'present')}
                              color="primary"
                            />
                          }
                          label="Present"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={student.status === 'absent'}
                              onChange={() => handleStudentStatusChange(student._id, 'absent')}
                              color="secondary"
                            />
                          }
                          label="Absent"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={student.status === 'late'}
                              onChange={() => handleStudentStatusChange(student._id, 'late')}
                              color="warning"
                            />
                          }
                          label="Late"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Attendance Records
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1565c0' }}>
                    <TableCell sx={{ color: 'white' }}>Student Name</TableCell>
                    <TableCell sx={{ color: 'white' }}>Student ID</TableCell>
                    <TableCell sx={{ color: 'white' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.map(attendance => (
                    <TableRow key={attendance._id}>
                      <TableCell>{attendance.studentName}</TableCell>
                      <TableCell>{attendance.studentId}</TableCell>
                      <TableCell>
                        <Box 
                          sx={{ 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1,
                            backgroundColor: 
                              attendance.status === 'present' ? '#e8f5e9' : 
                              attendance.status === 'absent' ? '#ffebee' : 
                              '#fff3e0',
                            color: 
                              attendance.status === 'present' ? '#2e7d32' : 
                              attendance.status === 'absent' ? '#c62828' : 
                              '#ef6c00'
                          }}
                        >
                          {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                        </Box>
                      </TableCell>
                      <TableCell>{attendance.date}</TableCell>
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

export default AttendanceForm;