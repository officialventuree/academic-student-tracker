const express = require('express');
const { protect, admin, teacher } = require('../middleware/auth');
const {
  getCarryMarksByStudent,
  calculateCarryMarks,
  getCarryMarksByClass,
  updateCarryMark,
  deleteCarryMark
} = require('../controllers/carryMarkController');

const router = express.Router();

// All routes are protected
router.route('/')
  .post(protect, calculateCarryMarks);  // Both admin and teacher can calculate carry marks

router.route('/class/:classId')
  .get(protect, getCarryMarksByClass);  // Both admin and teacher can view carry marks for a class

router.route('/student/:studentId')
  .get(protect, getCarryMarksByStudent);  // Both admin and teacher can view carry marks for a student

router.route('/:id')
  .put(protect, updateCarryMark)  // Both admin and teacher can update
  .delete(protect, admin, deleteCarryMark);  // Only admin can delete

module.exports = router;