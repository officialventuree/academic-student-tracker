const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add attendance date'],
    default: Date.now
  },
  status: {
    type: String,
    required: [true, 'Please add attendance status'],
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  academicYear: {
    type: String,
    required: [true, 'Please add academic year'],
    trim: true
  },
  term: {
    type: String,
    required: [true, 'Please add term'],
    enum: ['Semester 1', 'Semester 2']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

// Ensure each student has only one attendance record per date per class
attendanceSchema.index({ student: 1, class: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);