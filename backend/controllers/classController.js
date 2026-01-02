const Class = require('../models/Class');
const Student = require('../models/Student');
const User = require('../models/User');
const AdminLog = require('../models/AdminLog');
const { protect, admin, teacher } = require('../middleware/auth');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private (Admin and Teacher)
const getClasses = async (req, res) => {
  try {
    let classes;
    
    if (req.user.role === 'admin') {
      // Admins can see all classes
      classes = await Class.find({})
        .populate('teacher', 'name email')
        .populate('students', 'name studentId')
        .sort({ className: 1 });
    } else if (req.user.role === 'teacher') {
      // Teachers can only see their assigned classes
      classes = await Class.find({ teacher: req.user._id })
        .populate('teacher', 'name email')
        .populate('students', 'name studentId')
        .sort({ className: 1 });
    }

    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get class by ID
// @route   GET /api/classes/:id
// @access  Private (Admin and Teacher)
const getClassById = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name studentId');

    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user can access this class
    if (req.user.role === 'teacher' && classObj.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this class' });
    }

    res.json(classObj);
  } catch (error) {
    console.error('Get class by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Admin only)
const createClass = async (req, res) => {
  try {
    const { className, form, subject, academicYear, teacher: teacherId } = req.body;

    // Check if class already exists
    const classExists = await Class.findOne({ className, academicYear });
    if (classExists) {
      return res.status(400).json({ message: 'Class with this name already exists for the academic year' });
    }

    const newClass = new Class({
      className,
      form,
      subject,
      academicYear,
      teacher: teacherId
    });

    const createdClass = await newClass.save();

    // If a teacher is assigned, update their assignedClasses
    if (teacherId) {
      await User.findByIdAndUpdate(teacherId, {
        $push: { assignedClasses: createdClass._id }
      });
    }

    // Log admin action
    await AdminLog.create({
      user: req.user._id,
      action: 'CREATE_CLASS',
      entityType: 'Class',
      entityId: createdClass._id,
      details: `Created new class: ${createdClass.className}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(createdClass);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin only)
const updateClass = async (req, res) => {
  try {
    const { className, form, subject, academicYear, teacher: teacherId } = req.body;

    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Update class fields
    classObj.className = className || classObj.className;
    classObj.form = form || classObj.form;
    classObj.subject = subject || classObj.subject;
    classObj.academicYear = academicYear || classObj.academicYear;

    // If teacher is being updated
    if (teacherId && teacherId !== classObj.teacher.toString()) {
      // Remove class from old teacher's assigned classes
      if (classObj.teacher) {
        await User.findByIdAndUpdate(classObj.teacher, {
          $pull: { assignedClasses: classObj._id }
        });
      }
      
      // Add class to new teacher's assigned classes
      await User.findByIdAndUpdate(teacherId, {
        $push: { assignedClasses: classObj._id }
      });
      
      classObj.teacher = teacherId;
    }

    const updatedClass = await classObj.save();

    // Log admin action
    await AdminLog.create({
      user: req.user._id,
      action: 'UPDATE_CLASS',
      entityType: 'Class',
      entityId: updatedClass._id,
      details: `Updated class: ${updatedClass.className}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(updatedClass);
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin only)
const deleteClass = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Remove class from teacher's assigned classes
    if (classObj.teacher) {
      await User.findByIdAndUpdate(classObj.teacher, {
        $pull: { assignedClasses: classObj._id }
      });
    }

    // Remove class reference from all students in this class
    await Student.updateMany(
      { class: classObj._id },
      { class: null }
    );

    await classObj.remove();

    // Log admin action
    await AdminLog.create({
      user: req.user._id,
      action: 'DELETE_CLASS',
      entityType: 'Class',
      entityId: classObj._id,
      details: `Deleted class: ${classObj.className}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Class removed' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add student to class
// @route   PUT /api/classes/:id/students
// @access  Private (Admin only)
const addStudentToClass = async (req, res) => {
  try {
    const { studentId } = req.body;

    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Add student to class if not already added
    if (!classObj.students.includes(studentId)) {
      classObj.students.push(studentId);
      await classObj.save();
    }

    // Update student's class
    student.class = classObj._id;
    await student.save();

    res.json(classObj);
  } catch (error) {
    console.error('Add student to class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove student from class
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private (Admin only)
const removeStudentFromClass = async (req, res) => {
  try {
    const { studentId } = req.params;

    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove student from class
    classObj.students = classObj.students.filter(id => id.toString() !== studentId);
    await classObj.save();

    // Remove class from student
    student.class = null;
    await student.save();

    res.json(classObj);
  } catch (error) {
    console.error('Remove student from class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass
};