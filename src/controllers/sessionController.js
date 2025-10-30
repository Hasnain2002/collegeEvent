import Session from '../models/Session.js';
import User from '../models/User.js';

// Get all sessions
export async function getSessions(req, res) {
  try {
    const sessions = await Session.find().sort({ dateTime: 1 });
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
}

// Create a new session
export async function createSession(req, res) {
  try {
    const { title, description, speaker, location, dateTime, duration } = req.body;
    
    // Validate required fields
    if (!title || !description || !speaker || !location || !dateTime || !duration) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const sessionData = {
      title,
      description,
      speaker,
      location,
      dateTime: new Date(dateTime),
      duration: parseInt(duration)
    };
    
    // Add image if provided
    if (req.body.image) {
      sessionData.image = req.body.image;
    }
    
    const session = new Session(sessionData);
    await session.save();
    res.status(201).json({ session });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Update a session
export async function updateSession(req, res) {
  try {
    const { id } = req.params;
    const { title, description, speaker, location, dateTime, duration } = req.body;
    
    const updateData = {
      title,
      description,
      speaker,
      location,
      dateTime: new Date(dateTime),
      duration: parseInt(duration)
    };
    
    // Add image if provided
    if (req.body.image) {
      updateData.image = req.body.image;
    }
    
    const session = await Session.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json({ session });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Delete a session
export async function deleteSession(req, res) {
  try {
    const { id } = req.params;
    
    const session = await Session.findByIdAndDelete(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete session' });
  }
}

// Bookmark a session
export async function bookmarkSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Add user to bookmarks if not already bookmarked
    if (!session.bookmarks.includes(userId)) {
      session.bookmarks.push(userId);
      await session.save();
    }
    
    res.json({ message: 'Session bookmarked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to bookmark session' });
  }
}

// Remove bookmark from session
export async function removeBookmark(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Remove user from bookmarks
    session.bookmarks = session.bookmarks.filter(
      bookmarkId => bookmarkId.toString() !== userId
    );
    
    await session.save();
    
    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove bookmark' });
  }
}

// Get bookmarked sessions for user
export async function getBookmarkedSessions(req, res) {
  try {
    const userId = req.user.id;
    
    const sessions = await Session.find({ bookmarks: userId }).sort({ dateTime: 1 });
    
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookmarked sessions' });
  }
}