import { usingMemoryDb } from '../config/db.js';

// Import models only if using MongoDB
let Event, Registration;
if (!usingMemoryDb) {
  const models = await import('../models/Event.js');
  Event = models.default;
  const regModels = await import('../models/Registration.js');
  Registration = regModels.default;
} else {
  // Use in-memory DB utils when MongoDB is not available
  const { memoryDbUtils } = await import('../config/memoryDb.js');
  
  // Mock model methods for in-memory operations
  Event = {
    create: async (data) => memoryDbUtils.create('events', data),
    findOneAndUpdate: async (filter, update, options) => {
      // Find by _id from filter
      const id = filter._id;
      const item = await memoryDbUtils.findById('events', id);
      if (item) {
        return memoryDbUtils.update('events', id, update);
      }
      return null;
    },
    findOneAndDelete: async (filter) => {
      const id = filter._id;
      return memoryDbUtils.delete('events', id);
    },
    find: async (filter, projection, options) => {
      // Extract query conditions from filter
      const query = {};
      
      // Handle $or condition
      if (filter.$or) {
        query.$or = filter.$or;
      }
      
      // Handle date range
      if (filter.date && (filter.date.$gte || filter.date.$lte)) {
        query.date = {};
        if (filter.date.$gte) query.date.$gte = filter.date.$gte;
        if (filter.date.$lte) query.date.$lte = filter.date.$lte;
      }
      
      // Get filtered events
      let events = await memoryDbUtils.find('events', query);
      
      // Apply sorting if specified
      if (options?.sort) {
        const sortField = Object.keys(options.sort)[0];
        const sortOrder = options.sort[sortField] === -1 ? 'desc' : 'asc';
        events.sort((a, b) => {
          if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
          if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      // Apply pagination if specified
      if (options?.skip !== undefined && options?.limit !== undefined) {
        events = events.slice(options.skip, options.skip + options.limit);
      }
      
      return events;
    },
    findById: async (id) => memoryDbUtils.findById('events', id),
    countDocuments: async (filter) => {
      const events = await memoryDbUtils.find('events', filter);
      return events.length;
    },
    populate: function() { return this; } // No population needed for in-memory
  };
  
  // Similar mock for Registration model
  Registration = {
    countDocuments: async (filter) => {
      const registrations = await memoryDbUtils.find('registrations', filter);
      return registrations.length;
    }
  };
}

export const createEvent = async (req, res) => {
  try {
    const posterUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const event = await Event.create({ ...req.body, organizer: req.user.id, posterUrl });
    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const posterUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const update = { ...req.body };
    if (posterUrl) update.posterUrl = posterUrl;
    const event = await Event.findOneAndUpdate({ _id: req.params.id, organizer: req.user.id }, update, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, organizer: req.user.id });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listEvents = async (req, res) => {
  try {
    const { 
      q, 
      category, 
      status, 
      organizer,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;
    
    console.log('listEvents called with query:', { q, category, status, organizer, dateFrom, dateTo, sortBy, sortOrder, page, limit });
    
    const filter = {};
    
    // Text search in title and description
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) filter.category = category;
    
    // Status filter
    if (status) filter.status = status;
    
    // Organizer filter
    if (organizer) filter.organizer = organizer;
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }
    
    console.log('Filter:', filter);
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('Sort:', sort, 'Skip:', skip, 'Limit:', limit);
    
    // For in-memory DB, handle find and populate manually
    let events;
    let total;
    
    // Check if we're using in-memory DB (if Event.find doesn't have chainable methods)
    if (typeof Event.find === 'function' && !Event.find(filter).populate) {
      // Using in-memory DB - apply filter, sorting, pagination manually
      let allEvents = await Event.find(filter);
      
      // Apply sorting
      if (sortBy) {
        allEvents.sort((a, b) => {
          const aVal = a[sortBy];
          const bVal = b[sortBy];
          if (aVal < bVal) return sortOrder === 'desc' ? 1 : -1;
          if (aVal > bVal) return sortOrder === 'desc' ? -1 : 1;
          return 0;
        });
      }
      
      // Apply pagination
      total = allEvents.length;
      events = allEvents.slice(skip, skip + parseInt(limit));
      
      // Add organizer info for in-memory DB
      events = events.map(event => ({
        ...event,
        organizer: { name: event.organizer || 'Organizer' }
      }));
    } else {
      // Using MongoDB - use standard query with chaining
      events = await Event.find(filter)
        .populate('organizer', 'name')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
      total = await Event.countDocuments(filter);
    }
      
    console.log('Found events:', events);
    console.log('Total count:', total);
    
    res.json({ 
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalEvents: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('Error in listEvents:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name');
    if (!event) return res.status(404).json({ message: 'Not found' });
    const count = await Registration.countDocuments({ event: event._id, status: { $ne: 'cancelled' } });
    res.json({ event, registrations: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


