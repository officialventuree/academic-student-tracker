const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AdminLog = require('../models/AdminLog');
const { protect, admin, teacher } = require('../middleware/auth');

// @desc    Get attendance records for a class
// @route   GET /api/attendance/class/:classId
// @access  Private (Admin and Teacher)
const getAttendanceByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, academicYear, term } = req.query;

    let filter = { class: classId };
    
    if (date) filter.date = new Date(date);
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const attendanceRecords = await Attendance.find(filter)
      .populate('student', 'name studentId')
      .populate('class', 'className form subject')
      .sort({ date: -1, 'student.name': 1 });

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Get attendance by class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get attendance records for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private (Admin and Teacher)
const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { date, academicYear, term } = req.query;

    let filter = { student: studentId };
    
    if (date) filter.date = new Date(date);
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const attendanceRecords = await Attendance.find(filter)
      .populate('class', 'className form subject')
      .sort({ date: -1 });

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Get attendance by student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark attendance for multiple students
// @route   POST /api/attendance/mark
// @access  Private (Admin and Teacher)
const markAttendance = async (req, res) => {
  try {
    const { classId, date, academicYear, term, attendanceData } = req.body;

    // Verify class exists and user has access (for teachers)
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (req.user.role === 'teacher') {
      // Check if teacher can access this class
      if (!req.user.assignedClasses.includes(classId)) {
        return res.status(403).json({ message: 'Not authorized to access this class' });
      }
    }

    // Process each attendance record
    const results = [];
    for (const record of attendanceData) {
      const { studentId, status, notes } = record;

      // Verify student exists and belongs to the class
      const student = await Student.findById(studentId);
      if (!student) {
        results.push({ studentId, error: 'Student not found' });
        continue;
      }

      if (student.class.toString() !== classId) {
        results.push({ studentId, error: 'Student does not belong to this class' });
        continue;
      }

      // Check if attendance already exists for this date
      let attendance = await Attendance.findOne({
        student: studentId,
        class: classId,
        date: new Date(date)
      });

      if (attendance) {
        // Update existing attendance
        attendance.status = status;
        attendance.notes = notes || attendance.notes;
        attendance.updatedAt = new Date();
        await attendance.save();
      } else {
        // Create new attendance record
        attendance = new Attendance({
          student: studentId,
          class: classId,
          date: new Date(date),
          status,
          academicYear,
          term,
          notes
        });
        await attendance.save();
      }

      results.push({ studentId, status: attendance.status, id: attendance._id });
    }

    // Log admin action if performed by admin
    if (req.user.role === 'admin') {
      await AdminLog.create({
        user: req.user._id,
        action: 'UPDATE_ATTENDANCE',
        entityType: 'Attendance',
        details: `Marked attendance for ${attendanceData.length} students in class ${classObj.className}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({ results });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update single attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin and Teacher)
const updateAttendance = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Check if user can access the class this attendance belongs to
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(attendance.class.toString())) {
        return res.status(403).json({ message: 'Not authorized to access this attendance record' });
      }
    }

    // Update attendance fields
    attendance.status = status || attendance.status;
    attendance.notes = notes || attendance.notes;

    const updatedAttendance = await attendance.save();

    const student = await Student.findById(attendance.student);
    const classObj = await Class.findById(attendance.class);

    // Log admin action if performed by admin
    if (req.user.role === 'admin') {
      await AdminLog.create({
        user: req.user._id,
        action: 'UPDATE_ATTENDANCE',
        entityType: 'Attendance',
        entityId: updatedAttendance._id,
        details: `Updated attendance for student ${student.name} in class ${classObj.className}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json(updatedAttendance);
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin only)
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const student = await Student.findById(attendance.student);
    const classObj = await Class.findById(attendance.class);

    await attendance.remove();

    // Log admin action
    await AdminLog.create({
      user: req.user._id,
      action: 'UPDATE_ATTENDANCE',
      entityType: 'Attendance',
      entityId: attendance._id,
      details: `Deleted attendance for student ${student.name} in class ${classObj.className}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Attendance record removed' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get attendance summary for a class
// @route   GET /api/attendance/class/:classId/summary
// @access  Private (Admin and Teacher)
const getAttendanceSummary = async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate, academicYear, term } = req.query;

    let filter = { class: classId };
    
    if (startDate) filter.date = { ...filter.date, $gte: new Date(startDate) };
    if (endDate) filter.date = { ...filter.date, $lte: new Date(endDate) };
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const attendanceRecords = await Attendance.find(filter)
      .populate('student', 'name studentId');

    // Group by student
    const studentAttendance = {};
    attendanceRecords.forEach(record => {
      const studentId = record.student._id.toString();
      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = {
          student: record.student,
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      
      studentAttendance[studentId].total++;
      
      switch (record.status) {
        case 'present':
          studentAttendance[studentId].present++;
          break;
        case 'absent':
          studentAttendance[studentId].absent++;
          break;
        case 'late':
          studentAttendance[studentId].late++;
          break;
      }
    });

    // Calculate percentages
    Object.keys(studentAttendance).forEach(studentId => {
      const data = studentAttendance[studentId];
      data.percentage = data.total > 0 
        ? Number(((data.present / data.total) * 100).toFixed(2))
        : 0;
    });

    res.json(Object.values(studentAttendance));
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAttendanceByClass,
  getAttendanceByStudent,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceSummary
};