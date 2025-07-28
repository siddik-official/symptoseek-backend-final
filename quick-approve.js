// Quick script to make yourself admin and approve feedback
// Run this in your backend directory: node quick-approve.js

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/user');
const Feedback = require('./models/feedback');

async function quickSetup() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find your user by email (replace with your email)
    const yourEmail = 'your-email@example.com'; // CHANGE THIS TO YOUR EMAIL
    const user = await User.findOne({ email: yourEmail });

    if (user) {
      // Make you admin
      user.role = 'admin';
      await user.save();
      console.log(`✅ Made ${user.name} an admin`);

      // Approve all your pending feedback
      const pendingFeedback = await Feedback.find({
        userId: user._id,
        isPublic: true,
        isApproved: false
      });

      if (pendingFeedback.length > 0) {
        await Feedback.updateMany(
          { userId: user._id, isPublic: true, isApproved: false },
          { isApproved: true }
        );
        console.log(`✅ Approved ${pendingFeedback.length} feedback items`);
      } else {
        console.log('No pending feedback found');
      }
    } else {
      console.log('❌ User not found. Please check your email.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

quickSetup();
