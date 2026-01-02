const express = require('express');
const { protect, admin, teacher } = require('../middleware/auth');
const {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  updateAssignmentSubmission
} = require('../controllers/assignmentController');

const router = express.Router();

// All routes are protected
router.route('/')
  .get(protect, getAssignments)  // Both admin and teacher can view assignments
  .post(protect, createAssignment);  // Both admin and teacher can create assignments

router.route('/:id')
  .get(protect, getAssignmentById)  // Both admin and teacher can view specific assignment
  .put(protect, updateAssignment)  // Both admin and teacher can update
  .delete(protect, admin, deleteAssignment);  // Only admin can delete

router.route('/:id/submit')
  .post(protect, submitAssignment);  // Submit assignment

router.route('/:id/submissions')
  .get(protect, getAssignmentSubmissions);  // Get assignment submissions

router.route('/submissions/:id')
  .put(protect, updateAssignmentSubmission);  // Update assignment submission

module.exports = router;