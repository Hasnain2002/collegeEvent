import User from '../models/User.js';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

export const leaderboard = async (req, res) => {
  try {
    const top = await User.find({ role: { $in: ['customer', 'organizer'] }, isBlocked: false })
      .sort({ points: -1 })
      .limit(10)
      .select('name points');
    res.json({ leaderboard: top });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const recommendations = async (req, res) => {
  try {
    // Find categories from user's past registrations
    const regs = await Registration.find({ user: req.user.id }).populate('event', 'category');
    const categories = [...new Set(regs.map(r => r.event?.category).filter(Boolean))];
    const filter = { date: { $gte: new Date() }, status: 'approved' };
    if (categories.length) filter.category = { $in: categories };
    const events = await Event.find(filter).sort({ date: 1 }).limit(6);
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Quick counts for cards on the home page
export const summary = async (_req, res) => {
  try {
    const [totalEvents, approvedEvents, upcomingEvents, totalRegistrations, totalCustomers, totalOrganizers] = await Promise.all([
      Event.countDocuments({}),
      Event.countDocuments({ status: 'approved' }),
      Event.countDocuments({ status: 'approved', date: { $gte: new Date() } }),
      Registration.countDocuments({}),
      User.countDocuments({ role: 'customer', isBlocked: false }),
      User.countDocuments({ role: 'organizer', isBlocked: false }),
    ]);

    res.json({
      totals: {
        events: totalEvents,
        approvedEvents,
        upcomingEvents,
        registrations: totalRegistrations,
        customers: totalCustomers,
        organizers: totalOrganizers,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Popular/trending events
export const trending = async (_req, res) => {
  try {
    // Popular by registrations
    const popularAgg = await Registration.aggregate([
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);
    const popularIds = popularAgg.map(p => p._id).filter(Boolean);
    const popular = await Event.find({ _id: { $in: popularIds } }).lean();
    // Preserve order of popularity
    const popularityMap = new Map(popularAgg.map(p => [String(p._id), p.count]));
    const popularOrdered = popular
      .map(e => ({ ...e, registrations: popularityMap.get(String(e._id)) || 0 }))
      .sort((a,b) => (b.registrations - a.registrations));

    // Top rated events
    const topRated = await Event.find({ status: 'approved' })
      .sort({ averageRating: -1 })
      .limit(6)
      .lean();

    // Recently added approved events
    const recent = await Event.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.json({ popular: popularOrdered, topRated, recent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Stats for dashboard widgets (categories and upcoming timeline)
export const dashboardStats = async (_req, res) => {
  try {
    const categories = await Event.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const upcomingByMonth = await Event.aggregate([
      { $match: { status: 'approved', date: { $gte: new Date() } } },
      { $project: { ym: { $dateToString: { format: '%Y-%m', date: '$date' } } } },
      { $group: { _id: '$ym', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    res.json({ categories, upcomingByMonth });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Analytics data for admin dashboard
export const analytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total counts
    const [totalEvents, totalUsers, totalRegistrations, totalExhibitors] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments(),
      Registration.countDocuments(),
      // For now, we'll count organizers as exhibitors since we don't have a separate exhibitor model yet
      User.countDocuments({ role: 'organizer' })
    ]);

    // Get popular events (by registration count)
    const popularEventsAgg = await Registration.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$event', registrationCount: { $sum: 1 } } },
      { $sort: { registrationCount: -1 } },
      { $limit: 10 }
    ]);

    const popularEventIds = popularEventsAgg.map(p => p._id);
    const popularEvents = await Event.find({ _id: { $in: popularEventIds } }).lean();
    
    // Add registration count to events
    const popularEventsWithCount = popularEvents.map(event => {
      const agg = popularEventsAgg.find(p => p._id.toString() === event._id.toString());
      return { ...event, registrationCount: agg ? agg.registrationCount : 0 };
    });

    // Get user engagement (users with most activities)
    const userEngagement = await User.find({ role: { $in: ['customer', 'organizer'] } })
      .sort({ points: -1 })
      .limit(10)
      .select('name email role points');

    // For booth traffic, we'll simulate data since we don't have actual booth tracking yet
    const boothTraffic = [];

    res.json({
      totalEvents,
      totalUsers,
      totalRegistrations,
      totalExhibitors,
      popularEvents: popularEventsWithCount,
      userEngagement,
      boothTraffic
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


