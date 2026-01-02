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
  Link
} from '@mui/material';
import { SaveAlt as DownloadIcon } from '@mui/icons-material';
import axios from 'axios';

const ReportGenerator = () => {
  const [formData, setFormData] = useState({
    student: '',
    class: '',
    academicYear: new Date().getFullYear().toString(),
    semester: ''
  });
  
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [reports, setReports] = useState([]);
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
    
    // Mock reports data
    setReports([
      { _id: '1', studentName: 'Ahmad Ali', className: '4A', academicYear: '2024', semester: 'Semester 1', dateGenerated: '2024-03-15' },
      { _id: '2', studentName: 'Siti Aminah', className: '3B', academicYear: '2024', semester: 'Semester 1', dateGenerated: '2024-03-14' },
      { _id: '3', studentName: 'Mohd Zain', className: '5C', academicYear: '2024', semester: 'Semester 2', dateGenerated: '2024-08-20' }
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
      // In a real app, we would make an API call to generate the report
      console.log('Generating report:', formData);
      
      // Simulate PDF download
      // In a real app, this would be an API call to the backend to generate and return a PDF
      alert('In a real application, this would generate and download a PDF report.');
      
      // Add to reports history
      const newReport = {
        _id: Date.now().toString(),
        studentName: students.find(s => s._id === formData.student)?.name || 'Unknown',
        className: classes.find(c => c._id === formData.class)?.className || 'Unknown',
        academicYear: formData.academicYear,
        semester: formData.semester,
        dateGenerated: new Date().toISOString().split('T')[0]
      };
      
      setReports(prev => [...prev, newReport]);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (reportId) => {
    // In a real app, this would download the specific report
    alert(`Downloading report ${reportId}`);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#1565c0', mb: 3 }}>
        Report Generation
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate New Report
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Student</InputLabel>
                <Select
                  name="student"
                  value={formData.student}
                  label="Student"
                  onChange={handleInputChange}
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
                name="academicYear"
                label="Academic Year"
                type="text"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Semester</InputLabel>
                <Select
                  name="semester"
                  value={formData.semester}
                  label="Semester"
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="Semester 1">Semester 1</MenuItem>
                  <MenuItem value="Semester 2">Semester 2</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2, backgroundColor: '#1565c0' }}
                disabled={loading}
                startIcon={<DownloadIcon />}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Reports
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1565c0' }}>
                    <TableCell sx={{ color: 'white' }}>Student</TableCell>
                    <TableCell sx={{ color: 'white' }}>Class</TableCell>
                    <TableCell sx={{ color: 'white' }}>Academic Year</TableCell>
                    <TableCell sx={{ color: 'white' }}>Semester</TableCell>
                    <TableCell sx={{ color: 'white' }}>Date Generated</TableCell>
                    <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map(report => (
                    <TableRow key={report._id}>
                      <TableCell>{report.studentName}</TableCell>
                      <TableCell>{report.className}</TableCell>
                      <TableCell>{report.academicYear}</TableCell>
                      <TableCell>{report.semester}</TableCell>
                      <TableCell>{report.dateGenerated}</TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleDownloadReport(report._id)}
                          title="Download Report"
                        >
                          <DownloadIcon />
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
      
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Class Report Generation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Generate comprehensive reports for entire classes with student performance summaries.
          </Typography>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#1565c0' }}
            startIcon={<DownloadIcon />}
          >
            Generate Class Report
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default ReportGenerator;