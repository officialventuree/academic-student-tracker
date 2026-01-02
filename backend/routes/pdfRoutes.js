const express = require('express');
const { protect, admin, teacher } = require('../middleware/auth');
const {
  generateStudentReportPDF,
  generateClassReportPDF
} = require('../controllers/pdfController');

const router = express.Router();

// All routes are protected
router.route('/student/:studentId/pdf')
  .get(protect, generateStudentReportPDF);  // Both admin and teacher can generate student reports

router.route('/class/:classId/pdf')
  .get(protect, generateClassReportPDF);  // Both admin and teacher can generate class reports

module.exports = router;