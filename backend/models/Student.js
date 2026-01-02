const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Please add a student ID'],
    unique: true,
    trim: true,
    maxlength: [20, 'Student ID cannot be more than 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  form: {
    type: String,
    required: [true, 'Please add form level'],
    enum: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  parentName: {
    type: String,
    required: [true, 'Please add parent/guardian name'],
    trim: true,
    maxlength: [50, 'Parent name cannot be more than 50 characters']
  },
  parentContact: {
    type: String,
    required: [true, 'Please add parent contact'],
    trim: true,
    maxlength: [15, 'Phone number too long']
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);