const express = require('express');
const { protect, admin, teacher } = require('../middleware/auth');
const {
  getAssignmentsByClass,
  getAssignmentsByStudent,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions
} = require('../controllers/assignmentController');

const router = express.Router();

// All routes are protected
router.route('/')
  .post(protect, createAssignment);  // Both admin and teacher can create assignments

router.route('/class/:classId')
  .get(protect, getAssignmentsByClass);  // Both admin and teacher can view assignments for a class

router.route('/student/:studentId')
  .get(protect, getAssignmentsByStudent);  // Both admin and teacher can view assignments for a student

router.route('/:id')
  .put(protect, updateAssignment)  // Both admin and teacher can update
  .delete(protect, admin, deleteAssignment);  // Only admin can delete

router.route('/:id/submit')
  .put(protect, submitAssignment);  // Both admin and teacher can submit/update submissions

router.route('/:id/submissions')
  .get(protect, getAssignmentSubmissions);  // Both admin and teacher can view submissions

module.exports = router;