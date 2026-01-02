const express = require('express');
const { protect, admin, teacher } = require('../middleware/auth');
const {
  generateStudentReport
} = require('../controllers/pdfController');

const router = express.Router();

// All routes are protected
router.route('/student/:studentId')
  .get(protect, generateStudentReport);  // Both admin and teacher can generate student reports

module.exports = router;