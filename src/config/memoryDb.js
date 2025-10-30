/*
 * In-memory database for development when MongoDB is not available
 */
export const memoryDb = {
  events: [],
  users: [],
  registrations: [],
  reviews: [],
  sessions: [],
  feedbacks: [],
  notifications: [],
  exhibitors: []
};

// Simple CRUD operations for development
export const memoryDbUtils = {
  // Get all items from a collection
  getAll: (collection) => {
    return Promise.resolve(memoryDb[collection] || []);
  },

  // Find item by ID
  findById: (collection, id) => {
    const item = (memoryDb[collection] || []).find(item => item._id === id);
    return Promise.resolve(item || null);
  },

  // Find items by query
  find: (collection, query) => {
    let items = memoryDb[collection] || [];
    
    // If no query or empty query object, return all items
    if (!query || Object.keys(query).length === 0) {
      return Promise.resolve(items);
    }
    
    items = items.filter(item => {
      return Object.keys(query).every(key => {
        if (key === '$or') {
          return query[key].some(condition => 
            Object.keys(condition).every(condKey => 
              item[condKey] === condition[condKey]
            )
          );
        }
        return item[key] === query[key];
      });
    });
    
    return Promise.resolve(items);
  },

  // Create new item
  create: (collection, data) => {
    const id = Date.now().toString();
    const item = { _id: id, ...data, createdAt: new Date(), updatedAt: new Date() };
    
    if (!memoryDb[collection]) {
      memoryDb[collection] = [];
    }
    
    memoryDb[collection].push(item);
    return Promise.resolve(item);
  },

  // Update item
  update: (collection, id, data) => {
    const items = memoryDb[collection] || [];
    const index = items.findIndex(item => item._id === id);
    
    if (index !== -1) {
      items[index] = { ...items[index], ...data, updatedAt: new Date() };
      return Promise.resolve(items[index]);
    }
    
    return Promise.resolve(null);
  },

  // Delete item
  delete: (collection, id) => {
    const items = memoryDb[collection] || [];
    const index = items.findIndex(item => item._id === id);
    
    if (index !== -1) {
      const item = items.splice(index, 1)[0];
      return Promise.resolve(item);
    }
    
    return Promise.resolve(null);
  }
};