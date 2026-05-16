const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Validation middleware
const validateUpdateProfile = [
  body('username').optional().trim().isLength({ min: 3, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('profileImage').optional().isURL()
];

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', 
  authMiddleware.verifyToken, 
  authMiddleware.requireRole('admin'),
  async (req, res) => {
    try {
      const users = await User.find({})
        .select('-password -__v')
        .sort({ createdAt: -1 });

      res.json({
        count: users.length,
        users
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authMiddleware.verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -__v');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Allow users to view their own profile or admins to view any profile
    if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this profile' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', 
  authMiddleware.verifyToken, 
  validateUpdateProfile,
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Allow users to update their own profile or admins to update any profile
      if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this profile' });
      }

      const updates = req.body;
      const userId = req.params.id;

      // If email is being updated, check if it's already taken
      if (updates.email) {
        const existingUser = await User.findOne({ 
          email: updates.email, 
          _id: { $ne: userId } 
        });
        
        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      // If username is being updated, check if it's already taken
      if (updates.username) {
        const existingUser = await User.findOne({ 
          username: updates.username, 
          _id: { $ne: userId } 
        });
        
        if (existingUser) {
          return res.status(400).json({ error: 'Username already taken' });
        }
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password -__v');

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only or self-delete)
// @access  Private
router.delete('/:id', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Allow users to delete their own account or admins to delete any account
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this account' });
    }

    // Prevent admin from deleting themselves
    if (req.user.userId === userId && req.user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the only admin account' });
      }
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user account
// @access  Private/Admin
router.put('/:id/deactivate',
  authMiddleware.verifyToken,
  authMiddleware.requireRole('admin'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { isActive: false } },
        { new: true }
      ).select('-password -__v');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User deactivated successfully',
        user
      });
    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// @route   PUT /api/users/:id/activate
// @desc    Activate user account
// @access  Private/Admin
router.put('/:id/activate',
  authMiddleware.verifyToken,
  authMiddleware.requireRole('admin'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { isActive: true } },
        { new: true }
      ).select('-password -__v');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User activated successfully',
        user
      });
    } catch (error) {
      console.error('Activate user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// @route   GET /api/users/stats/count
// @desc    Get user statistics
// @access  Private/Admin
router.get('/stats/count',
  authMiddleware.verifyToken,
  authMiddleware.requireRole('admin'),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const students = await User.countDocuments({ role: 'student' });
      const instructors = await User.countDocuments({ role: 'instructor' });
      const admins = await User.countDocuments({ role: 'admin' });

      // Get new users in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const newUsersLast7Days = await User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      });

      res.json({
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        byRole: {
          students,
          instructors,
          admins
        },
        newUsersLast7Days
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
