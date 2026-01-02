const express = require('express');
const { protect, admin, teacher } = require('../middleware/auth');
const {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByClassDateRange,
  getAttendanceByStudentDateRange
} = require('../controllers/attendanceController');

const router = express.Router();

// All routes are protected
router.route('/')
  .get(protect, getAttendance)  // Both admin and teacher can view attendance
  .post(protect, createAttendance);  // Both admin and teacher can mark attendance

router.route('/:id')
  .get(protect, getAttendanceById)  // Both admin and teacher can view specific attendance
  .put(protect, updateAttendance)  // Both admin and teacher can update
  .delete(protect, admin, deleteAttendance);  // Only admin can delete

router.route('/class/:classId/date-range')
  .get(protect, getAttendanceByClassDateRange);  // Get attendance by class and date range

router.route('/student/:studentId/date-range')
  .get(protect, getAttendanceByStudentDateRange);  // Get attendance by student and date range

module.exports = router;