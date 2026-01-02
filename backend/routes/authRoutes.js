const express = require('express');
const { protect, admin } = require('../middleware/auth');
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  refreshToken,
  logoutUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/login', authUser);
router.post('/register', protect, admin, registerUser); // Only accessible by admin
router.post('/refresh', refreshToken);
router.post('/logout', protect, logoutUser);

// Private routes (require authentication)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin-only routes for user management
router.route('/users')
  .get(protect, admin, getUsers)  // Get all users
  .post(protect, admin, registerUser);  // Create new user

router.route('/users/:id')
  .get(protect, admin, getUserById)  // Get specific user
  .put(protect, admin, updateUser)  // Update user
  .delete(protect, admin, deleteUser);  // Delete user

module.exports = router;