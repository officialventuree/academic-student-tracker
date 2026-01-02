const express = require('express');
const { protect, admin, teacher } = require('../middleware/auth');
const {
  getAttendanceByClass,
  getAttendanceByStudent,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceSummary
} = require('../controllers/attendanceController');

const router = express.Router();

// All routes are protected
router.route('/')
  .post(protect, markAttendance);  // Both admin and teacher can mark attendance

router.route('/class/:classId')
  .get(protect, getAttendanceByClass);  // Both admin and teacher can view attendance for a class

router.route('/student/:studentId')
  .get(protect, getAttendanceByStudent);  // Both admin and teacher can view attendance for a student

router.route('/:id')
  .put(protect, updateAttendance)  // Both admin and teacher can update
  .delete(protect, admin, deleteAttendance);  // Only admin can delete

router.route('/class/:classId/summary')
  .get(protect, getAttendanceSummary);  // Both admin and teacher can view summary

module.exports = router;