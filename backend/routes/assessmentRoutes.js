const express = require('express');
const { protect, admin, teacher, canAccessClass, canAccessStudent } = require('../middleware/auth');
const {
  getAssessmentsByClass,
  getAssessmentsByStudent,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentStats
} = require('../controllers/assessmentController');

const router = express.Router();

// All routes are protected
router.route('/')
  .post(protect, createAssessment);  // Both admin and teacher can create assessments

router.route('/class/:classId')
  .get(protect, getAssessmentsByClass);  // Both admin and teacher can view assessments for a class

router.route('/student/:studentId')
  .get(protect, getAssessmentsByStudent);  // Both admin and teacher can view assessments for a student

router.route('/:id')
  .put(protect, updateAssessment)  // Both admin and teacher can update
  .delete(protect, admin, deleteAssessment);  // Only admin can delete

router.route('/class/:classId/stats')
  .get(protect, getAssessmentStats);  // Both admin and teacher can view stats

module.exports = router;