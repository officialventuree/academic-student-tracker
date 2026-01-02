const CarryMark = require('../models/CarryMark');
const Assessment = require('../models/Assessment');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AdminLog = require('../models/AdminLog');
const { protect, admin, teacher } = require('../middleware/auth');

// @desc    Get carry marks for a student
// @route   GET /api/carrymarks/student/:studentId
// @access  Private (Admin and Teacher)
const getCarryMarksByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, semester, academicYear } = req.query;

    let filter = { student: studentId };
    
    if (subject) filter.subject = subject;
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    const carryMarks = await CarryMark.find(filter)
      .populate('student', 'name studentId')
      .populate('class', 'className form subject')
      .sort({ createdAt: -1 });

    res.json(carryMarks);
  } catch (error) {
    console.error('Get carry marks by student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Calculate and update carry marks for a student
// @route   POST /api/carrymarks/calculate
// @access  Private (Admin and Teacher)
const calculateCarryMarks = async (req, res) => {
  try {
    const { studentId, classId, subject, semester, academicYear } = req.body;

    // Verify student and class exist
    const student = await Student.findById(studentId);
    const classObj = await Class.findById(classId);
    
    if (!student || !classObj) {
      return res.status(404).json({ message: 'Student or class not found' });
    }

    // Check if user can access the class (for teachers)
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(classId)) {
        return res.status(403).json({ message: 'Not authorized to access this class' });
      }
    }

    // Get all assessments for this student, class, subject, and semester
    const assessments = await Assessment.find({
      student: studentId,
      class: classId,
      subject,
      academicYear,
      term: semester
    });

    // Get assignment submissions for this student in the class and subject
    const assignments = await Assignment.find({
      class: classId,
      subject,
      academicYear
    });

    // Calculate assessment marks
    const assessmentMarks = {
      US1: 0,
      US2: 0,
      UASA: 0,
      US3: 0,
      US4: 0,
      UASA2: 0
    };

    assessments.forEach(assessment => {
      assessmentMarks[assessment.assessmentType] = assessment.marks;
    });

    // Calculate assignment average
    let totalAssignmentScore = 0;
    let assignmentCount = 0;

    assignments.forEach(assignment => {
      const submission = assignment.submissions.find(
        sub => sub.student.toString() === studentId
      );

      if (submission && submission.score !== null && submission.score !== undefined) {
        totalAssignmentScore += (submission.score / assignment.totalMarks) * 100;
        assignmentCount++;
      }
    });

    const assignmentAverage = assignmentCount > 0 
      ? totalAssignmentScore / assignmentCount 
      : 0;

    // Calculate attendance percentage
    const attendanceRecords = await Attendance.find({
      student: studentId,
      class: classId,
      academicYear,
      term: semester
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      record => record.status === 'present' || record.status === 'late'
    ).length;

    const attendancePercentage = totalDays > 0 
      ? (presentDays / totalDays) * 100 
      : 0;

    // Calculate final carry mark using weightages
    const assessmentTotal = Object.values(assessmentMarks).reduce((sum, mark) => sum + mark, 0);
    const assessmentAverage = Object.values(assessmentMarks).filter(mark => mark > 0).length > 0
      ? assessmentTotal / Object.values(assessmentMarks).filter(mark => mark > 0).length
      : 0;

    const finalCarryMark = 
      (assessmentAverage * 0.70) +  // 70% for assessments
      (assignmentAverage * 0.20) +  // 20% for assignments
      (attendancePercentage * 0.10); // 10% for attendance

    // Check if carry mark record already exists
    let carryMark = await CarryMark.findOne({
      student: studentId,
      class: classId,
      subject,
      semester,
      academicYear
    });

    if (carryMark) {
      // Update existing carry mark
      carryMark.assessmentMarks = assessmentMarks;
      carryMark.assignmentMarks.average = assignmentAverage;
      carryMark.attendancePercentage = attendancePercentage;
      carryMark.finalCarryMark = Number(finalCarryMark.toFixed(2));
      carryMark.updatedAt = new Date();
      
      await carryMark.save();
    } else {
      // Create new carry mark record
      carryMark = new CarryMark({
        student: studentId,
        class: classId,
        subject,
        semester,
        academicYear,
        assessmentMarks,
        assignmentMarks: { average: assignmentAverage },
        attendancePercentage,
        finalCarryMark: Number(finalCarryMark.toFixed(2))
      });

      await carryMark.save();
    }

    // Log admin action if performed by admin
    if (req.user.role === 'admin') {
      await AdminLog.create({
        user: req.user._id,
        action: 'UPDATE_ASSESSMENT',
        entityType: 'CarryMark',
        entityId: carryMark._id,
        details: `Calculated carry mark for student ${student.name} in ${subject} (${semester})`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json(carryMark);
  } catch (error) {
    console.error('Calculate carry marks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get carry marks for a class
// @route   GET /api/carrymarks/class/:classId
// @access  Private (Admin and Teacher)
const getCarryMarksByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { subject, semester, academicYear } = req.query;

    let filter = { class: classId };
    
    if (subject) filter.subject = subject;
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    const carryMarks = await CarryMark.find(filter)
      .populate('student', 'name studentId')
      .populate('class', 'className form subject')
      .sort({ 'student.name': 1 });

    res.json(carryMarks);
  } catch (error) {
    console.error('Get carry marks by class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update carry mark manually
// @route   PUT /api/carrymarks/:id
// @access  Private (Admin and Teacher)
const updateCarryMark = async (req, res) => {
  try {
    const { assessmentMarks, assignmentMarks, attendancePercentage, finalCarryMark } = req.body;

    const carryMark = await CarryMark.findById(req.params.id);
    if (!carryMark) {
      return res.status(404).json({ message: 'Carry mark record not found' });
    }

    // Check if user can access the class this carry mark belongs to
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(carryMark.class.toString())) {
        return res.status(403).json({ message: 'Not authorized to access this carry mark' });
      }
    }

    // Update carry mark fields
    if (assessmentMarks) carryMark.assessmentMarks = { ...carryMark.assessmentMarks, ...assessmentMarks };
    if (assignmentMarks) carryMark.assignmentMarks = { ...carryMark.assignmentMarks, ...assignmentMarks };
    if (attendancePercentage !== undefined) carryMark.attendancePercentage = attendancePercentage;
    if (finalCarryMark !== undefined) carryMark.finalCarryMark = Number(finalCarryMark.toFixed(2));

    const updatedCarryMark = await carryMark.save();

    const student = await Student.findById(carryMark.student);

    // Log admin action if performed by admin
    if (req.user.role === 'admin') {
      await AdminLog.create({
        user: req.user._id,
        action: 'UPDATE_ASSESSMENT',
        entityType: 'CarryMark',
        entityId: updatedCarryMark._id,
        details: `Updated carry mark for student ${student.name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json(updatedCarryMark);
  } catch (error) {
    console.error('Update carry mark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete carry mark record
// @route   DELETE /api/carrymarks/:id
// @access  Private (Admin only)
const deleteCarryMark = async (req, res) => {
  try {
    const carryMark = await CarryMark.findById(req.params.id);
    if (!carryMark) {
      return res.status(404).json({ message: 'Carry mark record not found' });
    }

    const student = await Student.findById(carryMark.student);

    await carryMark.remove();

    // Log admin action
    await AdminLog.create({
      user: req.user._id,
      action: 'UPDATE_ASSESSMENT',
      entityType: 'CarryMark',
      entityId: carryMark._id,
      details: `Deleted carry mark for student ${student.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Carry mark record removed' });
  } catch (error) {
    console.error('Delete carry mark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCarryMarksByStudent,
  calculateCarryMarks,
  getCarryMarksByClass,
  updateCarryMark,
  deleteCarryMark
};