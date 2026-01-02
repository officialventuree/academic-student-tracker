const Assessment = require('../models/Assessment');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AdminLog = require('../models/AdminLog');
const { protect, admin, teacher, canAccessClass, canAccessStudent } = require('../middleware/auth');

// @desc    Get all assessments for a class
// @route   GET /api/assessments/class/:classId
// @access  Private (Admin and Teacher)
const getAssessmentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { assessmentType, subject, academicYear } = req.query;

    let filter = { class: classId };
    
    if (assessmentType) filter.assessmentType = assessmentType;
    if (subject) filter.subject = subject;
    if (academicYear) filter.academicYear = academicYear;

    const assessments = await Assessment.find(filter)
      .populate('student', 'name studentId')
      .populate('class', 'className form subject');

    res.json(assessments);
  } catch (error) {
    console.error('Get assessments by class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all assessments for a student
// @route   GET /api/assessments/student/:studentId
// @access  Private (Admin and Teacher)
const getAssessmentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { assessmentType, subject, academicYear, term } = req.query;

    let filter = { student: studentId };
    
    if (assessmentType) filter.assessmentType = assessmentType;
    if (subject) filter.subject = subject;
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const assessments = await Assessment.find(filter)
      .populate('class', 'className form subject')
      .sort({ date: -1 });

    res.json(assessments);
  } catch (error) {
    console.error('Get assessments by student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new assessment
// @route   POST /api/assessments
// @access  Private (Admin and Teacher)
const createAssessment = async (req, res) => {
  try {
    const { student, class: classId, assessmentType, subject, marks, totalMarks, academicYear, term } = req.body;

    // Verify student exists and belongs to the class (for teachers)
    const studentObj = await Student.findById(student);
    if (!studentObj) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (req.user.role === 'teacher') {
      // Check if teacher can access this class
      if (!req.user.assignedClasses.includes(classId)) {
        return res.status(403).json({ message: 'Not authorized to access this class' });
      }
    }

    const newAssessment = new Assessment({
      student,
      class: classId,
      assessmentType,
      subject,
      marks,
      totalMarks,
      academicYear,
      term
    });

    const createdAssessment = await newAssessment.save();

    // Log admin action if performed by admin
    if (req.user.role === 'admin') {
      await AdminLog.create({
        user: req.user._id,
        action: 'UPDATE_ASSESSMENT',
        entityType: 'Assessment',
        entityId: createdAssessment._id,
        details: `Created ${assessmentType} assessment for student ${studentObj.name} in ${subject}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.status(201).json(createdAssessment);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:id
// @access  Private (Admin and Teacher)
const updateAssessment = async (req, res) => {
  try {
    const { marks, subject, totalMarks } = req.body;

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Check if user can access the class this assessment belongs to
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(assessment.class.toString())) {
        return res.status(403).json({ message: 'Not authorized to access this assessment' });
      }
    }

    // Update assessment fields
    assessment.marks = marks !== undefined ? marks : assessment.marks;
    assessment.subject = subject || assessment.subject;
    assessment.totalMarks = totalMarks !== undefined ? totalMarks : assessment.totalMarks;

    const updatedAssessment = await assessment.save();

    const student = await Student.findById(assessment.student);

    // Log admin action if performed by admin
    if (req.user.role === 'admin') {
      await AdminLog.create({
        user: req.user._id,
        action: 'UPDATE_ASSESSMENT',
        entityType: 'Assessment',
        entityId: updatedAssessment._id,
        details: `Updated ${assessment.assessmentType} assessment for student ${student.name} in ${assessment.subject}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json(updatedAssessment);
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private (Admin only)
const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const student = await Student.findById(assessment.student);

    await assessment.remove();

    // Log admin action
    await AdminLog.create({
      user: req.user._id,
      action: 'UPDATE_ASSESSMENT',
      entityType: 'Assessment',
      entityId: assessment._id,
      details: `Deleted ${assessment.assessmentType} assessment for student ${student.name} in ${assessment.subject}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Assessment removed' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get assessment statistics for a class
// @route   GET /api/assessments/class/:classId/stats
// @access  Private (Admin and Teacher)
const getAssessmentStats = async (req, res) => {
  try {
    const { classId } = req.params;
    const { assessmentType, subject, academicYear } = req.query;

    let filter = { class: classId };
    
    if (assessmentType) filter.assessmentType = assessmentType;
    if (subject) filter.subject = subject;
    if (academicYear) filter.academicYear = academicYear;

    const assessments = await Assessment.find(filter);

    if (assessments.length === 0) {
      return res.json({
        count: 0,
        average: 0,
        highest: 0,
        lowest: 0
      });
    }

    const totalMarks = assessments.reduce((sum, assessment) => sum + assessment.marks, 0);
    const average = totalMarks / assessments.length;
    const highest = Math.max(...assessments.map(a => a.marks));
    const lowest = Math.min(...assessments.map(a => a.marks));

    res.json({
      count: assessments.length,
      average: Number(average.toFixed(2)),
      highest,
      lowest
    });
  } catch (error) {
    console.error('Get assessment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAssessmentsByClass,
  getAssessmentsByStudent,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentStats
};