const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: [true, 'Please add a class name'],
    unique: true,
    trim: true,
    maxlength: [30, 'Class name cannot be more than 30 characters']
  },
  form: {
    type: String,
    required: [true, 'Please add form level'],
    enum: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true
  },
  academicYear: {
    type: String,
    required: [true, 'Please add academic year'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', classSchema);