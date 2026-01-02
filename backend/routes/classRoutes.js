const express = require('express');
const { protect, admin, teacher } = require('../middleware/auth');
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassesByTeacher
} = require('../controllers/classController');

const router = express.Router();

// All routes are protected
router.route('/')
  .get(protect, getClasses)  // Both admin and teacher can view classes
  .post(protect, admin, createClass);  // Only admin can create

router.route('/:id')
  .get(protect, getClassById)  // Both admin and teacher can view specific class
  .put(protect, admin, updateClass)  // Only admin can update
  .delete(protect, admin, deleteClass);  // Only admin can delete

router.route('/teacher/:teacherId')
  .get(protect, getClassesByTeacher);  // Get classes by teacher

module.exports = router;