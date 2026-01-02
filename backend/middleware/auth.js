const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else if (req.cookies && req.cookies.refreshToken) {
    // If no access token in header, try to refresh using cookie
    try {
      const decoded = jwt.verify(req.cookies.refreshToken, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, refresh token failed' });
    }
  }

  if (!token && !(req.cookies && req.cookies.refreshToken)) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
};

const teacher = (req, res, next) => {
  if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
    next(); // Teachers and admins can access teacher routes
  } else {
    return res.status(403).json({ message: 'Not authorized as teacher' });
  }
};

// Middleware to check if user can access a specific class (for teachers)
const canAccessClass = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      // Admins can access all classes
      return next();
    }

    if (req.user.role === 'teacher') {
      // For teacher-specific routes that require class parameter
      if (req.params.classId) {
        const classId = req.params.classId;
        if (req.user.assignedClasses.includes(classId)) {
          return next();
        }
      } else if (req.body.class) {
        const classId = req.body.class;
        if (req.user.assignedClasses.includes(classId)) {
          return next();
        }
      } else if (req.query.classId) {
        const classId = req.query.classId;
        if (req.user.assignedClasses.includes(classId)) {
          return next();
        }
      }
      
      return res.status(403).json({ message: 'Not authorized to access this class' });
    }

    return res.status(403).json({ message: 'Not authorized' });
  } catch (error) {
    console.error('Class access check error:', error);
    return res.status(500).json({ message: 'Server error during class access check' });
  }
};

// Middleware to check if user can access a specific student
const canAccessStudent = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      // Admins can access all students
      return next();
    }

    if (req.user.role === 'teacher') {
      // Teachers can only access students in their assigned classes
      let studentId = req.params.studentId || req.body.student || req.query.studentId;
      
      if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
      }

      // In a real implementation, we would fetch the student and check if they're in one of the teacher's classes
      // For now, we'll just pass the check and let the route handle the actual verification
      return next();
    }

    return res.status(403).json({ message: 'Not authorized' });
  } catch (error) {
    console.error('Student access check error:', error);
    return res.status(500).json({ message: 'Server error during student access check' });
  }
};

module.exports = { protect, admin, teacher, canAccessClass, canAccessStudent };