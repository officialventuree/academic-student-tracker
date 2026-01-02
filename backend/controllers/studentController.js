const Student = require('../models/Student');
const Class = require('../models/Class');
const AdminLog = require('../models/AdminLog');
const { protect, admin, teacher, canAccessStudent } = require('../middleware/auth');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin and Teacher)
const getStudents = async (req, res) => {
  try {
    let students;
    
    if (req.user.role === 'admin') {
      // Admins can see all students
      students = await Student.find({ isActive: true })
        .populate('class', 'className form subject')
        .sort({ name: 1 });
    } else if (req.user.role === 'teacher') {
      // Teachers can only see students in their assigned classes
      const teacherClasses = req.user.assignedClasses;
      students = await Student.find({ 
        class: { $in: teacherClasses },
        isActive: true 
      })
        .populate('class', 'className form subject')
        .sort({ name: 1 });
    }

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private (Admin and Teacher)
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'className form subject');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if user can access this student
    if (req.user.role === 'teacher') {
      const teacherClasses = req.user.assignedClasses;
      if (!teacherClasses.includes(student.class._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to access this student' });
      }
    }

    res.json(student);
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (Admin only)
const createStudent = async (req, res) => {
  try {
    const { studentId, name, form, class: classId, parentName, parentContact } = req.body;

    // Check if student ID already exists
    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    const student = new Student({
      studentId,
      name,
      form,
      class: classId,
      parentName,
      parentContact
    });

    const createdStudent = await student.save();

    // Log admin action
    await AdminLog.create({
      user: req.user._id,
      action: 'CREATE_STUDENT',
      entityType: 'Student',
      entityId: createdStudent._id,
      details: `Created new student: ${createdStudent.name} (ID: ${createdStudent.studentId})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(createdStudent);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin only)
const updateStudent = async (req, res) => {
  try {
    const { name, form, class: classId, parentName, parentContact } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student fields
    student.name = name || student.name;
    student.form = form || student.form;
    student.class = classId || student.class;
    student.parentName = parentName || student.parentName;
    student.parentContact = parentContact || student.parentContact;

    const updatedStudent = await student.save();

    // Log admin action
    await AdminLog.create({
      user: req.user._id,
      action: 'UPDATE_STUDENT',
      entityType: 'Student',
      entityId: updatedStudent._id,
      details: `Updated student: ${updatedStudent.name} (ID: ${updatedStudent.studentId})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(updatedStudent);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Deactivate (soft delete) student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
const deactivateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Instead of deleting, set isActive to false
    student.isActive = false;
    await student.save();

    // Log admin action
    await AdminLog.create({
      user: req.user._id,
      action: 'DELETE_STUDENT',
      entityType: 'Student',
      entityId: student._id,
      details: `Deactivated student: ${student.name} (ID: ${student.studentId})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Student deactivated' });
  } catch (error) {
    console.error('Deactivate student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update student class
// @route   PUT /api/students/:id/class
// @access  Private (Admin only)
const updateStudentClass = async (req, res) => {
  try {
    const { classId } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const oldClass = student.class;
    student.class = classId;
    await student.save();

    // Log admin action
    await AdminLog.create({
      user: req.user._id,
      action: 'UPDATE_STUDENT_CLASS',
      entityType: 'Student',
      entityId: student._id,
      details: `Updated class for student ${student.name} (ID: ${student.studentId}) from ${oldClass} to ${classId}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(student);
  } catch (error) {
    console.error('Update student class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update student form/grade
// @route   PUT /api/students/:id/form
// @access  Private (Admin only)
const updateStudentForm = async (req, res) => {
  try {
    const { form } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const oldForm = student.form;
    student.form = form;
    await student.save();

    // Log admin action
    await AdminLog.create({
      user: req.user._id,
      action: 'UPDATE_STUDENT_GRADE',
      entityType: 'Student',
      entityId: student._id,
      details: `Updated form for student ${student.name} (ID: ${student.studentId}) from ${oldForm} to ${form}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(student);
  } catch (error) {
    console.error('Update student form error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deactivateStudent,
  updateStudentClass,
  updateStudentForm
};