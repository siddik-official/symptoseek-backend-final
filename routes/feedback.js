const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get public approved feedback for testimonials
router.get('/public', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const feedback = await Feedback.find({
      isPublic: true,
      isApproved: true
    })
    .populate({
      path: 'userId',
      select: 'profile_pic name',
      model: 'User'
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('userName rating feedback createdAt category userId');

    // Transform the data to include profile picture
    const transformedFeedback = feedback.map(item => ({
      _id: item._id,
      userName: item.userName,
      rating: item.rating,
      feedback: item.feedback,
      createdAt: item.createdAt,
      category: item.category,
      userProfilePic: item.userId?.profile_pic || null
    }));

    res.json({
      success: true,
      data: transformedFeedback
    });
  } catch (error) {
    console.error('Error fetching public feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
});

// Get user's own feedback
router.get('/my-feedback', authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('rating feedback isPublic isApproved category createdAt');

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your feedback'
    });
  }
});

// Submit new feedback
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { rating, feedback, isPublic, category } = req.body;

    // Validate required fields
    if (!rating || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'Rating and feedback are required'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Fetch user details from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new feedback
    const newFeedback = new Feedback({
      userId: req.user.id,
      userName: user.name,
      userEmail: user.email,
      rating,
      feedback,
      isPublic: isPublic || false,
      category: category || 'general'
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: newFeedback._id,
        rating: newFeedback.rating,
        feedback: newFeedback.feedback,
        isPublic: newFeedback.isPublic,
        category: newFeedback.category,
        createdAt: newFeedback.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
});

// Update feedback
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { rating, feedback, isPublic, category } = req.body;
    const feedbackId = req.params.id;

    // Find feedback and verify ownership
    const existingFeedback = await Feedback.findOne({
      _id: feedbackId,
      userId: req.user.id
    });

    if (!existingFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found or unauthorized'
      });
    }

    // Fetch user details if we need to update userName or userEmail
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (rating) existingFeedback.rating = rating;
    if (feedback) existingFeedback.feedback = feedback;
    if (typeof isPublic === 'boolean') existingFeedback.isPublic = isPublic;
    if (category) existingFeedback.category = category;

    // Update user info in case it changed
    existingFeedback.userName = user.name;
    existingFeedback.userEmail = user.email;

    // Reset approval status if content changed
    if (rating || feedback) {
      existingFeedback.isApproved = false;
    }

    await existingFeedback.save();

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: existingFeedback
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback'
    });
  }
});

// Delete feedback
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const feedbackId = req.params.id;

    const deletedFeedback = await Feedback.findOneAndDelete({
      _id: feedbackId,
      userId: req.user.id
    });

    if (!deletedFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback'
    });
  }
});

// Admin routes for managing feedback
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments();

    res.json({
      success: true,
      data: feedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
});

// Admin approve/reject feedback
router.patch('/admin/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { isApproved } = req.body;
    const feedbackId = req.params.id;

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { isApproved },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: `Feedback ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback approval:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback approval'
    });
  }
});

module.exports = router;
