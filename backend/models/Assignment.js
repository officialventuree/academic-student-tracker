const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add assignment title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
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
  assignedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add due date']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please add total marks'],
    min: [1, 'Total marks must be at least 1']
  },
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    submittedAt: {
      type: Date
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100']
    },
    status: {
      type: String,
      enum: ['submitted', 'not_submitted', 'late'],
      default: 'not_submitted'
    },
    fileUrl: {
      type: String,
      trim: true
    }
  }],
  academicYear: {
    type: String,
    required: [true, 'Please add academic year'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);