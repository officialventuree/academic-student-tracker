const express = require('express');
const { protect, admin, teacher } = require('../middleware/auth');
const {
  getCarryMarks,
  getCarryMarkById,
  createCarryMark,
  updateCarryMark,
  deleteCarryMark
} = require('../controllers/carryMarkController');

const router = express.Router();

// All routes are protected
router.route('/')
  .get(protect, getCarryMarks)  // Both admin and teacher can view carry marks
  .post(protect, createCarryMark);  // Both admin and teacher can create/update carry marks

router.route('/:id')
  .get(protect, getCarryMarkById)  // Both admin and teacher can view specific carry mark
  .put(protect, updateCarryMark)  // Both admin and teacher can update
  .delete(protect, admin, deleteCarryMark);  // Only admin can delete

module.exports = router;