import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import { generateQRCodeDataUrl } from '../utils/qrcode.js';
import { sendEmail } from '../utils/email.js';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import { createNotification } from './notificationController.js';

export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.status !== 'approved') return res.status(400).json({ message: 'Event not available' });
    
    // Check if user is already registered (any status)
    const existingRegistration = await Registration.findOne({ user: req.user.id, event: event._id });
    if (existingRegistration) {
      return res.status(400).json({ message: 'You have already registered for this event' });
    }
    
    // Check event capacity if it's set (capacity > 0)
    if (event.capacity > 0) {
      const approvedRegistrationsCount = await Registration.countDocuments({ 
        event: event._id, 
        status: 'approved' 
      });
      
      if (approvedRegistrationsCount >= event.capacity) {
        return res.status(400).json({ message: 'Event capacity reached. No more registrations allowed.' });
      }
    }
    
    // Create pending registration
    const reg = await Registration.create({ user: req.user.id, event: event._id, status: 'pending' });
    
    // Send notification to user that registration is pending
    try {
      await sendEmail({ 
        to: req.user.email, 
        subject: `Registration Request: ${event.title}`, 
        html: `<p>Your registration for ${event.title} is pending admin approval.</p>` 
      });
      
      // Create in-app notification for user
      await createNotification(
        req.user.id,
        'Registration Requested',
        `Your registration for ${event.title} is pending admin approval.`,
        'info',
        reg._id,
        'registration'
      );
      
      // TODO: Create notification for admin (would need to find admin users)
    } catch (_) {}
    
    res.status(201).json({ registration: reg, message: 'Registration request submitted. Awaiting admin approval.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const myRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ user: req.user.id }).populate('event');
    res.json({ registrations: regs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPendingRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('event', 'title date location');
    res.json({ registrations: regs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate QR code when registration is approved
async function generateQrCodeForRegistration(registration) {
  const payload = JSON.stringify({ 
    userId: registration.user.toString(), 
    eventId: registration.event.toString(), 
    at: Date.now() 
  });
  const qrCodeDataUrl = await generateQRCodeDataUrl(payload);
  return qrCodeDataUrl;
}

export const approveRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('user')
      .populate('event');
      
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    if (registration.status !== 'pending') {
      return res.status(400).json({ message: `Registration is already ${registration.status}` });
    }
    
    // Check event capacity if it's set (capacity > 0)
    if (registration.event.capacity > 0) {
      const approvedRegistrationsCount = await Registration.countDocuments({ 
        event: registration.event._id, 
        status: 'approved' 
      });
      
      if (approvedRegistrationsCount >= registration.event.capacity) {
        return res.status(400).json({ message: 'Event capacity reached. Cannot approve more registrations.' });
      }
    }
    
    // Generate QR code for approved registration
    const qrCodeDataUrl = await generateQrCodeForRegistration(registration);
    
    // Update registration to approved status
    registration.status = 'approved';
    registration.approvedBy = req.user.id;
    registration.approvedAt = new Date();
    registration.qrCodeDataUrl = qrCodeDataUrl;
    
    await registration.save();
    
    // Send notification to user
    try {
      await sendEmail({ 
        to: registration.user.email, 
        subject: `Registration Approved: ${registration.event.title}`, 
        html: `<p>Your registration for ${registration.event.title} has been approved!</p><p>You can now download your ticket.</p>` 
      });
      
      // Create in-app notification
      await createNotification(
        registration.user._id,
        'Registration Approved',
        `You were registered! Enjoy the event: ${registration.event.title}`,
        'success',
        registration._id,
        'registration'
      );
    } catch (_) {}
    
    res.json({ registration, message: 'Registration approved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const denyRegistration = async (req, res) => {
  try {
    const { reason } = req.body;
    const registration = await Registration.findById(req.params.id)
      .populate('user')
      .populate('event');
      
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    if (registration.status !== 'pending') {
      return res.status(400).json({ message: `Registration is already ${registration.status}` });
    }
    
    // Update registration to denied status
    registration.status = 'denied';
    registration.approvedBy = req.user.id;
    registration.approvedAt = new Date();
    registration.denialReason = reason;
    
    await registration.save();
    
    // Send notification to user
    try {
      await sendEmail({ 
        to: registration.user.email, 
        subject: `Registration Denied: ${registration.event.title}`, 
        html: `<p>Your registration for ${registration.event.title} has been denied.</p>${reason ? `<p>Reason: ${reason}</p>` : ''}` 
      });
      
      // Create in-app notification
      await createNotification(
        registration.user._id,
        'Registration Denied',
        `Your registration for ${registration.event.title} was denied. ${reason ? `Reason: ${reason}` : ''}`,
        'error',
        registration._id,
        'registration'
      );
    } catch (_) {}
    
    res.json({ registration, message: 'Registration denied' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const participantsForEvent = async (req, res) => {
  try {
    const regs = await Registration.find({ event: req.params.id }).populate('user', 'name email');
    res.json({ participants: regs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const checkInParticipant = async (req, res) => {
  try {
    const reg = await Registration.findOneAndUpdate(
      { user: req.body.userId, event: req.params.id },
      { status: 'attended', checkedInAt: new Date() },
      { new: true }
    );
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    res.json({ registration: reg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const exportParticipantsCsv = async (req, res) => {
  try {
    const regs = await Registration.find({ event: req.params.id }).populate('user', 'name email');
    const rows = regs.map(r => ({ name: r.user?.name || '', email: r.user?.email || '', status: r.status, registeredAt: r.createdAt }));
    const filePath = path.join(process.cwd(), `participants-${req.params.id}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'status', title: 'Status' },
        { id: 'registeredAt', title: 'Registered At' },
      ],
    });
    await csvWriter.writeRecords(rows);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


