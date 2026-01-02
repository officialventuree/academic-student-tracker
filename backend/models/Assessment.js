const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
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
  assessmentType: {
    type: String,
    required: [true, 'Please add assessment type'],
    enum: ['US1', 'US2', 'UASA', 'US3', 'US4', 'UASA2']
  },
  subject: {
    type: String,
    required: [true, 'Please add subject'],
    trim: true
  },
  marks: {
    type: Number,
    required: [true, 'Please add marks'],
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  date: {
    type: Date,
    required: [true, 'Please add assessment date'],
    default: Date.now
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assessment', assessmentSchema);