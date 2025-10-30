import Feedback from '../models/Feedback.js';

export const submitFeedback = async (req, res) => {
  try {
    const { type, subject, message } = req.body;
    
    // Validate required fields
    if (!type || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Create feedback
    const feedback = new Feedback({
      user: req.user.id,
      type,
      subject,
      message
    });
    
    await feedback.save();
    
    res.status(201).json({ 
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        type: feedback.type,
        subject: feedback.subject,
        message: feedback.message,
        createdAt: feedback.createdAt
      }
    });
  } catch (err) {
    console.error('Feedback submission error:', err);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

export const listFeedback = async (req, res) => {
  try {
    // Only admins can list all feedback
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const feedback = await Feedback.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json({ feedback });
  } catch (err) {
    console.error('Feedback listing error:', err);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
};