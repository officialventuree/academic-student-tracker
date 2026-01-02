const mongoose = require('mongoose');

const carryMarkSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: [true, 'Please add subject'],
    trim: true
  },
  semester: {
    type: String,
    required: [true, 'Please add semester'],
    enum: ['Semester 1', 'Semester 2']
  },
  academicYear: {
    type: String,
    required: [true, 'Please add academic year'],
    trim: true
  },
  assessmentMarks: {
    US1: { type: Number, default: 0 },
    US2: { type: Number, default: 0 },
    UASA: { type: Number, default: 0 },
    US3: { type: Number, default: 0 },
    US4: { type: Number, default: 0 },
    UASA2: { type: Number, default: 0 }
  },
  assignmentMarks: {
    average: { type: Number, default: 0 }
  },
  attendancePercentage: { type: Number, default: 0 },
  finalCarryMark: { type: Number, default: 0 },
  weightages: {
    assessment: { type: Number, default: 70 }, // 70% for assessments
    assignment: { type: Number, default: 20 }, // 20% for assignments
    attendance: { type: Number, default: 10 }  // 10% for attendance
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CarryMark', carryMarkSchema);