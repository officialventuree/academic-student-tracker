const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: [true, 'Please add action type'],
    enum: [
      'CREATE_STUDENT', 'UPDATE_STUDENT', 'DELETE_STUDENT', 
      'UPDATE_STUDENT_CLASS', 'UPDATE_STUDENT_GRADE',
      'CREATE_TEACHER', 'UPDATE_TEACHER', 'DELETE_TEACHER',
      'CREATE_CLASS', 'UPDATE_CLASS', 'DELETE_CLASS',
      'UPDATE_ASSESSMENT', 'UPDATE_ASSIGNMENT', 'UPDATE_ATTENDANCE',
      'GENERATE_REPORT', 'OTHER'
    ]
  },
  entityType: {
    type: String,
    enum: ['Student', 'User', 'Class', 'Assessment', 'Assignment', 'Attendance', 'Report', 'Other']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: String,
    trim: true,
    maxlength: [500, 'Details cannot be more than 500 characters']
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminLog', adminLogSchema);