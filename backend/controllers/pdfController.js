const PDFDocument = require('pdfkit');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Assessment = require('../models/Assessment');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const CarryMark = require('../models/CarryMark');
const { protect, admin, teacher } = require('../middleware/auth');

// @desc    Generate student report PDF
// @route   GET /api/reports/student/:studentId/pdf
// @access  Private (Admin and Teacher)
const generateStudentReportPDF = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester } = req.query;

    // Get student data
    const student = await Student.findById(studentId)
      .populate('class', 'className form subject');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if user can access this student (for teachers)
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(student.class._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to access this student' });
      }
    }

    // Get all required data for the report
    const assessments = await Assessment.find({
      student: studentId,
      academicYear,
      term: semester
    }).sort({ assessmentType: 1, date: 1 });

    const assignments = await Assignment.find({
      class: student.class._id,
      academicYear
    }).populate({
      path: 'submissions.student',
      select: 'name'
    });

    const attendanceRecords = await Attendance.find({
      student: studentId,
      academicYear,
      term: semester
    });

    const carryMark = await CarryMark.findOne({
      student: studentId,
      academicYear,
      semester
    });

    // Create PDF
    const doc = new PDFDocument();
    
    // Set response headers for PDF download
    res.setHeader('Content-disposition', `attachment; filename="report-${student.name}-${academicYear}-${semester}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');
    
    // School header
    doc.fontSize(18).text('Sekolah Menengah Kebangsaan', 50, 40, { align: 'center' });
    doc.fontSize(16).text('Mathematics Department', 50, 65, { align: 'center' });
    doc.fontSize(14).text(`Academic Year: ${academicYear}`, 50, 90, { align: 'center' });
    doc.moveDown();

    // Student info
    doc.fontSize(14).text(`Student Report`, 50, 130);
    doc.fontSize(12).text(`Name: ${student.name}`, 50, 150);
    doc.fontSize(12).text(`Student ID: ${student.studentId}`, 50, 170);
    doc.fontSize(12).text(`Form: ${student.class.form}`, 50, 190);
    doc.fontSize(12).text(`Class: ${student.class.className}`, 50, 210);
    doc.fontSize(12).text(`Semester: ${semester}`, 50, 230);
    doc.moveDown();

    // Assessment marks table
    if (assessments.length > 0) {
      doc.fontSize(12).text('Assessment Marks', 50, doc.y);
      doc.moveDown();
      
      // Table header
      let y = doc.y;
      doc.rect(50, y, 100, 20).fill('#e0e0e0');
      doc.rect(150, y, 100, 20).fill('#e0e0e0');
      doc.rect(250, y, 100, 20).fill('#e0e0e0');
      
      doc.fill('black').fontSize(10).text('Assessment Type', 60, y + 5);
      doc.text('Subject', 160, y + 5);
      doc.text('Marks', 260, y + 5);
      
      y += 20;
      
      // Table rows
      assessments.forEach(assessment => {
        doc.rect(50, y, 100, 20).stroke();
        doc.rect(150, y, 100, 20).stroke();
        doc.rect(250, y, 100, 20).stroke();
        
        doc.text(assessment.assessmentType, 60, y + 5);
        doc.text(assessment.subject, 160, y + 5);
        doc.text(`${assessment.marks}/${assessment.totalMarks}`, 260, y + 5);
        
        y += 20;
      });
      
      doc.y = y + 20;
    }

    // Assignment marks table
    if (assignments.length > 0) {
      doc.fontSize(12).text('Assignment Marks', 50, doc.y);
      doc.moveDown();
      
      // Table header
      let y = doc.y;
      doc.rect(50, y, 100, 20).fill('#e0e0e0');
      doc.rect(150, y, 100, 20).fill('#e0e0e0');
      doc.rect(250, y, 100, 20).fill('#e0e0e0');
      doc.rect(350, y, 100, 20).fill('#e0e0e0');
      
      doc.fill('black').fontSize(10).text('Assignment Title', 60, y + 5);
      doc.text('Subject', 160, y + 5);
      doc.text('Score', 260, y + 5);
      doc.text('Status', 360, y + 5);
      
      y += 20;
      
      // Table rows
      assignments.forEach(assignment => {
        const submission = assignment.submissions.find(
          sub => sub.student.toString() === studentId
        );
        
        doc.rect(50, y, 100, 20).stroke();
        doc.rect(150, y, 100, 20).stroke();
        doc.rect(250, y, 100, 20).stroke();
        doc.rect(350, y, 100, 20).stroke();
        
        doc.text(assignment.title, 60, y + 5);
        doc.text(assignment.subject, 160, y + 5);
        doc.text(submission ? `${submission.score}/${assignment.totalMarks}` : 'N/A', 260, y + 5);
        doc.text(submission ? submission.status : 'Not Submitted', 360, y + 5);
        
        y += 20;
      });
      
      doc.y = y + 20;
    }

    // Attendance summary
    if (attendanceRecords.length > 0) {
      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter(
        record => record.status === 'present' || record.status === 'late'
      ).length;
      const attendancePercentage = totalDays > 0 
        ? ((presentDays / totalDays) * 100).toFixed(2) 
        : 0;

      doc.fontSize(12).text('Attendance Summary', 50, doc.y);
      doc.moveDown();
      
      doc.fontSize(10).text(`Total Days: ${totalDays}`, 50, doc.y);
      doc.text(`Present: ${presentDays}`, 50, doc.y + 20);
      doc.text(`Absent: ${totalDays - presentDays}`, 50, doc.y + 40);
      doc.text(`Attendance Rate: ${attendancePercentage}%`, 50, doc.y + 60);
      doc.moveDown();
    }

    // Carry mark summary
    if (carryMark) {
      doc.fontSize(12).text('Carry Mark Summary', 50, doc.y);
      doc.moveDown();
      
      doc.fontSize(10).text(`Subject: ${carryMark.subject}`, 50, doc.y);
      doc.text(`Semester: ${carryMark.semester}`, 50, doc.y + 20);
      doc.text(`Assessment Average: ${carryMark.assessmentMarks.average || 0}`, 50, doc.y + 40);
      doc.text(`Assignment Average: ${carryMark.assignmentMarks.average}`, 50, doc.y + 60);
      doc.text(`Attendance Percentage: ${carryMark.attendancePercentage}%`, 50, doc.y + 80);
      doc.text(`Final Carry Mark: ${carryMark.finalCarryMark}`, 50, doc.y + 100);
      doc.moveDown();
    }

    // Footer
    const date = new Date().toLocaleDateString();
    doc.fontSize(10).text(`Generated on: ${date}`, 50, doc.page.height - 50);
    doc.text('Confidential Academic Report', doc.page.width - 200, doc.page.height - 50, { align: 'right' });

    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate class report PDF
// @route   GET /api/reports/class/:classId/pdf
// @access  Private (Admin and Teacher)
const generateClassReportPDF = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear, semester } = req.query;

    // Get class data
    const classObj = await Class.findById(classId)
      .populate('teacher', 'name email');
    
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user can access this class (for teachers)
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(classId)) {
        return res.status(403).json({ message: 'Not authorized to access this class' });
      }
    }

    // Get all students in the class
    const students = await Student.find({ 
      class: classId, 
      isActive: true 
    }).sort({ name: 1 });

    // For each student, get their assessments, assignments, attendance, and carry marks
    const classData = [];
    for (const student of students) {
      const assessments = await Assessment.find({
        student: student._id,
        academicYear,
        term: semester
      });

      const assignments = await Assignment.find({
        class: classId,
        academicYear
      });

      const attendanceRecords = await Attendance.find({
        student: student._id,
        academicYear,
        term: semester
      });

      const carryMark = await CarryMark.findOne({
        student: student._id,
        academicYear,
        semester
      });

      classData.push({
        student,
        assessments,
        assignments,
        attendanceRecords,
        carryMark
      });
    }

    // Create PDF
    const doc = new PDFDocument();
    
    // Set response headers for PDF download
    res.setHeader('Content-disposition', `attachment; filename="class-report-${classObj.className}-${academicYear}-${semester}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');
    
    // School header
    doc.fontSize(18).text('Sekolah Menengah Kebangsaan', 50, 40, { align: 'center' });
    doc.fontSize(16).text('Mathematics Department', 50, 65, { align: 'center' });
    doc.fontSize(14).text(`Academic Year: ${academicYear}`, 50, 90, { align: 'center' });
    doc.moveDown();

    // Class info
    doc.fontSize(14).text(`Class Report`, 50, 130);
    doc.fontSize(12).text(`Class: ${classObj.className}`, 50, 150);
    doc.fontSize(12).text(`Form: ${classObj.form}`, 50, 170);
    doc.fontSize(12).text(`Subject: ${classObj.subject}`, 50, 190);
    doc.fontSize(12).text(`Semester: ${semester}`, 50, 210);
    doc.fontSize(12).text(`Teacher: ${classObj.teacher.name}`, 50, 230);
    doc.moveDown();

    // Student table
    doc.fontSize(12).text('Student Performance Summary', 50, doc.y);
    doc.moveDown();

    // Table header
    let y = doc.y;
    doc.rect(50, y, 80, 20).fill('#e0e0e0');
    doc.rect(130, y, 120, 20).fill('#e0e0e0');
    doc.rect(250, y, 80, 20).fill('#e0e0e0');
    doc.rect(330, y, 100, 20).fill('#e0e0e0');
    doc.rect(430, y, 100, 20).fill('#e0e0e0');

    doc.fill('black').fontSize(10).text('Student ID', 60, y + 5);
    doc.text('Name', 140, y + 5);
    doc.text('Avg Marks', 260, y + 5);
    doc.text('Attendance %', 340, y + 5);
    doc.text('Carry Mark', 440, y + 5);

    y += 20;

    // Table rows
    for (const data of classData) {
      // Calculate average assessment marks
      let totalAssessmentMarks = 0;
      let assessmentCount = 0;
      data.assessments.forEach(assessment => {
        totalAssessmentMarks += assessment.marks;
        assessmentCount++;
      });
      const avgAssessment = assessmentCount > 0 
        ? (totalAssessmentMarks / assessmentCount).toFixed(2) 
        : 0;

      // Calculate attendance percentage
      const totalDays = data.attendanceRecords.length;
      const presentDays = data.attendanceRecords.filter(
        record => record.status === 'present' || record.status === 'late'
      ).length;
      const attendancePercentage = totalDays > 0 
        ? ((presentDays / totalDays) * 100).toFixed(2) 
        : 0;

      // Draw row
      doc.rect(50, y, 80, 20).stroke();
      doc.rect(130, y, 120, 20).stroke();
      doc.rect(250, y, 80, 20).stroke();
      doc.rect(330, y, 100, 20).stroke();
      doc.rect(430, y, 100, 20).stroke();

      doc.text(data.student.studentId, 60, y + 5);
      doc.text(data.student.name, 140, y + 5);
      doc.text(avgAssessment, 260, y + 5);
      doc.text(`${attendancePercentage}%`, 340, y + 5);
      doc.text(data.carryMark ? data.carryMark.finalCarryMark.toFixed(2) : 'N/A', 440, y + 5);

      y += 20;

      // Check if we need a new page
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
    }

    doc.y = y + 20;

    // Footer
    const date = new Date().toLocaleDateString();
    doc.fontSize(10).text(`Generated on: ${date}`, 50, doc.page.height - 50);
    doc.text('Confidential Academic Report', doc.page.width - 200, doc.page.height - 50, { align: 'right' });

    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Generate class PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  generateStudentReportPDF,
  generateClassReportPDF
};