const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AdminLog = require('../models/AdminLog');
const { protect, admin, teacher } = require('../middleware/auth');

// @desc    Get all assignments for a class
// @route   GET /api/assignments/class/:classId
// @access  Private (Admin and Teacher)
const getAssignmentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { subject, academicYear } = req.query;

    let filter = { class: classId };
    
    if (subject) filter.subject = subject;
    if (academicYear) filter.academicYear = academicYear;

    const assignments = await Assignment.find(filter)
      .populate('class', 'className form subject')
      .sort({ assignedDate: -1 });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments by class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all assignments for a student
// @route   GET /api/assignments/student/:studentId
// @access  Private (Admin and Teacher)
const getAssignmentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, academicYear } = req.query;

    // Get all assignments for the student's class
    const student = await Student.findById(studentId).populate('class');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let filter = { class: student.class._id };
    
    if (subject) filter.subject = subject;
    if (academicYear) filter.academicYear = academicYear;

    const assignments = await Assignment.find(filter)
      .populate('class', 'className form subject')
      .sort({ assignedDate: -1 });

    // Add submission status for the specific student
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = assignment.submissions.find(sub => 
        sub.student.toString() === studentId
      );
      
      return {
        ...assignment._doc,
        submission: submission || null
      };
    });

    res.json(assignmentsWithStatus);
  } catch (error) {
    console.error('Get assignments by student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Admin and Teacher)
const createAssignment = async (req, res) => {
  try {
    const { title, description, class: classId, subject, dueDate, totalMarks, academicYear } = req.body;

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

    const newAssignment = new Assignment({
      title,
      description,
      class: classId,
      subject,
      dueDate,
      totalMarks,
      academicYear
    });

    const createdAssignment = await newAssignment.save();

    // Log admin action if performed by admin
    if (req.user.role === 'admin') {
      await AdminLog.create({
        user: req.user._id,
        action: 'UPDATE_ASSIGNMENT',
        entityType: 'Assignment',
        entityId: createdAssignment._id,
        details: `Created assignment '${title}' for class ${classObj.className}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.status(201).json(createdAssignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Admin and Teacher)
const updateAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, totalMarks } = req.body;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user can access the class this assignment belongs to
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(assignment.class.toString())) {
        return res.status(403).json({ message: 'Not authorized to access this assignment' });
      }
    }

    // Update assignment fields
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;
    assignment.totalMarks = totalMarks !== undefined ? totalMarks : assignment.totalMarks;

    const updatedAssignment = await assignment.save();

    const classObj = await Class.findById(assignment.class);

    // Log admin action if performed by admin
    if (req.user.role === 'admin') {
      await AdminLog.create({
        user: req.user._id,
        action: 'UPDATE_ASSIGNMENT',
        entityType: 'Assignment',
        entityId: updatedAssignment._id,
        details: `Updated assignment '${updatedAssignment.title}' for class ${classObj.className}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json(updatedAssignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Admin only)
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const classObj = await Class.findById(assignment.class);

    await assignment.remove();

    // Log admin action
    await AdminLog.create({
      user: req.user._id,
      action: 'UPDATE_ASSIGNMENT',
      entityType: 'Assignment',
      entityId: assignment._id,
      details: `Deleted assignment '${assignment.title}' for class ${classObj.className}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Assignment removed' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit assignment for a student
// @route   PUT /api/assignments/:id/submit
// @access  Private (Admin and Teacher)
const submitAssignment = async (req, res) => {
  try {
    const { studentId, score, status, fileUrl } = req.body;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user can access the class this assignment belongs to
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(assignment.class.toString())) {
        return res.status(403).json({ message: 'Not authorized to access this assignment' });
      }
    }

    // Check if submission already exists for this student
    const existingSubmissionIndex = assignment.submissions.findIndex(
      sub => sub.student.toString() === studentId
    );

    if (existingSubmissionIndex > -1) {
      // Update existing submission
      assignment.submissions[existingSubmissionIndex].submittedAt = new Date();
      if (score !== undefined) assignment.submissions[existingSubmissionIndex].score = score;
      if (status) assignment.submissions[existingSubmissionIndex].status = status;
      if (fileUrl) assignment.submissions[existingSubmissionIndex].fileUrl = fileUrl;
    } else {
      // Add new submission
      assignment.submissions.push({
        student: studentId,
        submittedAt: new Date(),
        score: score || null,
        status: status || 'submitted',
        fileUrl: fileUrl || null
      });
    }

    const updatedAssignment = await assignment.save();

    res.json(updatedAssignment);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get assignment submissions for a class
// @route   GET /api/assignments/:id/submissions
// @access  Private (Admin and Teacher)
const getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate({
        path: 'submissions.student',
        select: 'name studentId'
      })
      .populate('class', 'className form subject');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user can access the class this assignment belongs to
    if (req.user.role === 'teacher') {
      if (!req.user.assignedClasses.includes(assignment.class._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to access this assignment' });
      }
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAssignmentsByClass,
  getAssignmentsByStudent,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions
};