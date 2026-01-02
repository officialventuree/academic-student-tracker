const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');
const asyncHandler = require('express-async-handler');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private (Admin and Teacher)
const getAttendance = asyncHandler(async (req, res) => {
  try {
    const { classId, studentId, date } = req.query;
    
    let attendanceRecords;
    
    if (classId) {
      if (date) {
        attendanceRecords = await Attendance.findByClassDate(classId, date);
      } else {
        attendanceRecords = await Attendance.findByClass(classId);
      }
    } else if (studentId) {
      if (date) {
        // Specific date for student
        attendanceRecords = await Attendance.findByStudentClassDate(studentId, req.query.classId, date);
      } else {
        // All records for student
        attendanceRecords = await Attendance.findByStudent(studentId);
      }
    } else {
      // For admin access - all attendance records
      if (req.user.role === 'admin') {
        // We would need to implement a method to fetch all attendance records
        // For now, return empty array or implement the method
        attendanceRecords = [];
      } else {
        return res.status(403).json({ message: 'Class or student ID required' });
      }
    }
    
    res.json(attendanceRecords);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Private (Admin and Teacher)
const getAttendanceById = asyncHandler(async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create/update attendance record
// @route   POST /api/attendance
// @access  Private (Admin and Teacher)
const createAttendance = asyncHandler(async (req, res) => {
  try {
    const { studentId, classId, date, status, session, notes } = req.body;

    // Check if student and class exist
    const student = await Student.findById(studentId);
    const classObj = await Class.findById(classId);

    if (!student || !classObj) {
      return res.status(400).json({ message: 'Student or class not found' });
    }

    // Check if teacher is assigned to this class (for teacher role)
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(classId.toString())) {
        return res.status(403).json({ message: 'Not authorized to take attendance for this class' });
      }
    }

    // Check if attendance record already exists for this student, class, and date
    const existingAttendance = await Attendance.findByStudentClassDate(studentId, classId, date);
    
    let attendance;
    if (existingAttendance) {
      // Update existing record
      attendance = await Attendance.update(existingAttendance.id, {
        status,
        session,
        notes
      });
    } else {
      // Create new record
      attendance = await Attendance.create({
        studentId,
        classId,
        date,
        status,
        session,
        notes,
        teacherId: req.user.id
      });
    }

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update an attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin and Teacher)
const updateAttendance = asyncHandler(async (req, res) => {
  try {
    const { status, session, notes } = req.body;

    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Check if teacher is assigned to this class (for teacher role)
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(attendance.classId.toString())) {
        return res.status(403).json({ message: 'Not authorized to update this attendance record' });
      }
    }

    const updatedAttendance = await Attendance.update(req.params.id, {
      status: status || attendance.status,
      session: session || attendance.session,
      notes: notes || attendance.notes
    });

    res.json(updatedAttendance);
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete an attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin only)
const deleteAttendance = asyncHandler(async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await Attendance.delete(req.params.id);

    res.json({ message: 'Attendance record removed' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get attendance by class and date range
// @route   GET /api/attendance/class/:classId/date-range
// @access  Private (Admin and Teacher)
const getAttendanceByClassDateRange = asyncHandler(async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const attendanceRecords = await Attendance.findByClassDateRange(classId, startDate, endDate);

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Get attendance by class date range error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get attendance by student and date range
// @route   GET /api/attendance/student/:studentId/date-range
// @access  Private (Admin and Teacher)
const getAttendanceByStudentDateRange = asyncHandler(async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const attendanceRecords = await Attendance.findByStudentDateRange(studentId, startDate, endDate);

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Get attendance by student date range error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByClassDateRange,
  getAttendanceByStudentDateRange
};