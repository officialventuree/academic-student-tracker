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
  TableRow
} from '@mui/material';
import axios from 'axios';

const AssessmentForm = () => {
  const [formData, setFormData] = useState({
    student: '',
    class: '',
    assessmentType: '',
    subject: '',
    marks: '',
    totalMarks: 100,
    academicYear: new Date().getFullYear().toString(),
    term: ''
  });
  
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch students and classes from the backend
    // For now, we'll use mock data
    setStudents([
      { _id: '1', name: 'Ahmad Ali', studentId: 'S001' },
      { _id: '2', name: 'Siti Aminah', studentId: 'S002' },
      { _id: '3', name: 'Mohd Zain', studentId: 'S003' },
      { _id: '4', name: 'Norazlina', studentId: 'S004' },
      { _id: '5', name: 'Kumar', studentId: 'S005' }
    ]);
    
    setClasses([
      { _id: '1', className: '4A', subject: 'Mathematics' },
      { _id: '2', className: '3B', subject: 'Science' },
      { _id: '3', className: '5C', subject: 'English' },
      { _id: '4', className: '2A', subject: 'History' },
      { _id: '5', className: '4B', subject: 'Geography' }
    ]);
    
    // Mock assessments data
    setAssessments([
      { _id: '1', studentName: 'Ahmad Ali', className: '4A', subject: 'Mathematics', assessmentType: 'US1', marks: 85, date: '2024-02-15' },
      { _id: '2', studentName: 'Siti Aminah', className: '3B', subject: 'Science', assessmentType: 'US2', marks: 78, date: '2024-03-20' },
      { _id: '3', studentName: 'Mohd Zain', className: '5C', subject: 'English', assessmentType: 'UASA', marks: 92, date: '2024-04-10' }
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
      // In a real app, we would make an API call to save the assessment
      console.log('Saving assessment:', formData);
      
      // Update the assessments list with the new assessment
      const newAssessment = {
        _id: Date.now().toString(),
        studentName: students.find(s => s._id === formData.student)?.name || 'Unknown',
        className: classes.find(c => c._id === formData.class)?.className || 'Unknown',
        subject: formData.subject,
        assessmentType: formData.assessmentType,
        marks: formData.marks,
        date: new Date().toISOString().split('T')[0]
      };
      
      setAssessments(prev => [...prev, newAssessment]);
      setFormData({
        student: '',
        class: '',
        assessmentType: '',
        subject: '',
        marks: '',
        totalMarks: 100,
        academicYear: new Date().getFullYear().toString(),
        term: ''
      });
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#1565c0', mb: 3 }}>
        Assessment Marks Entry
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Enter Assessment Details
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Student</InputLabel>
                <Select
                  name="student"
                  value={formData.student}
                  label="Student"
                  onChange={handleInputChange}
                  required
                >
                  {students.map(student => (
                    <MenuItem key={student._id} value={student._id}>
                      {student.name} ({student.studentId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
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
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Assessment Type</InputLabel>
                <Select
                  name="assessmentType"
                  value={formData.assessmentType}
                  label="Assessment Type"
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="US1">US1</MenuItem>
                  <MenuItem value="US2">US2</MenuItem>
                  <MenuItem value="UASA">UASA (Semester 1)</MenuItem>
                  <MenuItem value="US3">US3</MenuItem>
                  <MenuItem value="US4">US4</MenuItem>
                  <MenuItem value="UASA2">UASA2 (Semester 2)</MenuItem>
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
                name="marks"
                label="Marks"
                type="number"
                value={formData.marks}
                onChange={handleInputChange}
                required
              />
              
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
                {loading ? 'Saving...' : 'Save Assessment'}
              </Button>
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Assessments
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1565c0' }}>
                    <TableCell sx={{ color: 'white' }}>Student</TableCell>
                    <TableCell sx={{ color: 'white' }}>Class</TableCell>
                    <TableCell sx={{ color: 'white' }}>Subject</TableCell>
                    <TableCell sx={{ color: 'white' }}>Type</TableCell>
                    <TableCell sx={{ color: 'white' }}>Marks</TableCell>
                    <TableCell sx={{ color: 'white' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assessments.map(assessment => (
                    <TableRow key={assessment._id}>
                      <TableCell>{assessment.studentName}</TableCell>
                      <TableCell>{assessment.className}</TableCell>
                      <TableCell>{assessment.subject}</TableCell>
                      <TableCell>{assessment.assessmentType}</TableCell>
                      <TableCell>{assessment.marks}</TableCell>
                      <TableCell>{assessment.date}</TableCell>
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

export default AssessmentForm;