const PDFDocument = require('pdfkit');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Assessment = require('../models/Assessment');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const CarryMark = require('../models/CarryMark');
const asyncHandler = require('express-async-handler');

// @desc    Generate student report PDF
// @route   GET /api/reports/student/:studentId
// @access  Private (Admin and Teacher)
const generateStudentReport = asyncHandler(async (req, res) => {
  try {
    const { studentId } = req.params;
    const { reportType = 'full' } = req.query; // full, semester1, semester2, cumulative

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const classObj = await Class.findById(student.classId);
    
    // Get assessments for the student
    const assessments = await Assessment.findByStudent(studentId);
    
    // Get assignments for the student
    const assignmentSubmissions = []; // Would need to implement a method to get assignment submissions by student
    
    // Get attendance records for the student
    const attendanceRecords = await Attendance.findByStudent(studentId);
    
    // Get carry marks for the student
    const carryMarks = await CarryMark.findByStudent(studentId);

    // Create PDF
    const doc = new PDFDocument();
    const filename = `Student_Report_${student.name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`;
    
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
    
    doc.pipe(res);

    // School header
    doc.fontSize(16).text('SMK METHODIST', 50, 50);
    doc.fontSize(14).text('Mathematics Department', 50, 70);
    doc.fontSize(12).text(`Academic Year: ${new Date().getFullYear()}`, 50, 90);
    doc.moveDown();

    // Student info
    doc.fontSize(14).text('Student Report', 50, 130);
    doc.fontSize(12);
    doc.text(`Name: ${student.name}`, 50, 150);
    doc.text(`Student ID: ${student.studentId}`, 50, 170);
    doc.text(`Form: ${student.form}`, 50, 190);
    if (classObj) {
      doc.text(`Class: ${classObj.className}`, 50, 210);
    }
    doc.moveDown();

    // Assessments table
    if (assessments.length > 0) {
      doc.fontSize(12).text('Assessment Marks', 50, doc.y);
      doc.moveDown();
      
      // Table header
      let y = doc.y;
      doc.text('Subject', 50, y);
      doc.text('Type', 150, y);
      doc.text('Score', 250, y);
      doc.text('Date', 350, y);
      y += 20;
      
      // Table rows
      assessments.forEach(assessment => {
        doc.text(assessment.subject || 'N/A', 50, y);
        doc.text(assessment.assessmentType || 'N/A', 150, y);
        doc.text(`${assessment.score || 0}/${assessment.maxScore || 100}`, 250, y);
        doc.text(assessment.dateTaken || 'N/A', 350, y);
        y += 20;
      });
      
      doc.y = y + 20;
    }

    // Attendance summary
    if (attendanceRecords.length > 0) {
      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
      const attendancePercentage = totalDays > 0 ? (presentDays / totalDays * 100).toFixed(2) : 0;
      
      doc.fontSize(12).text('Attendance Summary', 50, doc.y);
      doc.text(`Total Days: ${totalDays}`, 50, doc.y + 20);
      doc.text(`Present: ${presentDays}`, 50, doc.y + 40);
      doc.text(`Attendance Rate: ${attendancePercentage}%`, 50, doc.y + 60);
      doc.moveDown();
    }

    // Carry marks
    if (carryMarks.length > 0) {
      doc.fontSize(12).text('Carry Marks', 50, doc.y);
      doc.moveDown();
      
      // Table header
      let y = doc.y;
      doc.text('Subject', 50, y);
      doc.text('Semester', 150, y);
      doc.text('US1', 220, y);
      doc.text('US2', 260, y);
      doc.text('UASA', 300, y);
      doc.text('Total', 360, y);
      doc.text('Grade', 420, y);
      y += 20;
      
      // Table rows
      carryMarks.forEach(mark => {
        doc.text(mark.subject || 'N/A', 50, y);
        doc.text(`Sem ${mark.semester || 'N/A'}`, 150, y);
        doc.text(`${mark.us1 || 0}`, 220, y);
        doc.text(`${mark.us2 || 0}`, 260, y);
        doc.text(`${mark.uasa1 || 0}`, 300, y);
        doc.text(`${mark.totalMark || 0}`, 360, y);
        doc.text(mark.grade || 'N/A', 420, y);
        y += 20;
      });
      
      doc.y = y + 20;
    }

    // Footer
    doc.fontSize(10);
    const date = new Date().toLocaleDateString();
    doc.text(`Generated on: ${date}`, 50, doc.page.height - 50);

    doc.end();
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Server error generating PDF' });
  }
});

module.exports = {
  generateStudentReport
};