const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        return res.status(401).json({ 
          message: 'Account is deactivated. Please contact administrator.' 
        });
      }

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedClasses: user.assignedClasses,
        accessToken,
      });
    } else {
      res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login' 
    });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private (Admin only)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, assignedClasses } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      assignedClasses: assignedClasses || []
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedClasses: user.assignedClasses,
      accessToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration' 
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedClasses: user.assignedClasses,
      });
    } else {
      res.status(404).json({ 
        message: 'User not found' 
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Server error fetching profile' 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        assignedClasses: updatedUser.assignedClasses,
      });
    } else {
      res.status(404).json({ 
        message: 'User not found' 
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error updating profile' 
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (uses refresh token from cookie)
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ 
      message: 'No refresh token provided' 
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(403).json({ 
        message: 'Invalid refresh token - user not found' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Account is deactivated' 
      });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Set new refresh token in HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ 
      message: 'Invalid or expired refresh token' 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  // Clear the refresh token cookie
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({ 
    message: 'Logged out successfully' 
  });
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Server error fetching users' 
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/auth/users/:id
// @access  Private (Admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      message: 'Server error fetching user' 
    });
  }
};

// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const { name, email, role, assignedClasses, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.assignedClasses = assignedClasses !== undefined ? assignedClasses : user.assignedClasses;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    // Only update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      assignedClasses: updatedUser.assignedClasses,
      isActive: updatedUser.isActive
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: 'Server error updating user' 
    });
  }
};

// @desc    Delete user (soft delete by deactivating)
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Instead of deleting, set isActive to false
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: 'Server error deleting user' 
    });
  }
};

module.exports = {
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
};