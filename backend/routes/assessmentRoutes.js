const express = require('express');
const { protect, admin, teacher, canAccessClass, canAccessStudent } = require('../middleware/auth');
const {
  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentsByStudentAndSubject
} = require('../controllers/assessmentController');

const router = express.Router();

// All routes are protected
router.route('/')
  .get(protect, getAssessments)  // Both admin and teacher can view assessments
  .post(protect, createAssessment);  // Both admin and teacher can create assessments

router.route('/:id')
  .get(protect, getAssessmentById)  // Both admin and teacher can view specific assessment
  .put(protect, updateAssessment)  // Both admin and teacher can update
  .delete(protect, admin, deleteAssessment);  // Only admin can delete

router.route('/student/:studentId/subject/:subject')
  .get(protect, getAssessmentsByStudentAndSubject);  // Get assessments by student and subject

module.exports = router;