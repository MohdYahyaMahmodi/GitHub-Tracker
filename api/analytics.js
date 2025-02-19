// This file should be placed in /api/analytics.js
const { MongoClient } = require('mongodb');

// MongoDB connection caching for serverless
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  try {
    // Connect to MongoDB with options
    const uri = process.env.MONGODB_URI;
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    const client = new MongoClient(uri, options);
    await client.connect();
    const db = client.db('profile-counter');
    
    // Cache the client and db connections
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

// Basic authentication middleware
function isAuthenticated(req) {
  // This is a simple authentication mechanism
  // In production, you should implement proper authentication
  const apiKey = req.headers['x-api-key'];
  return apiKey === process.env.API_KEY;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Check authentication for analytics
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const { username } = req.query;
    const days = parseInt(req.query.days || '30', 10);
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    try {
      const { db } = await connectToDatabase();
      
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);
      
      const result = await db.collection('counters').findOne(
        { username },
        { projection: { _id: 0, username: 1, count: 1, lastUpdated: 1 }}
      );
      
      if (!result) {
        return res.status(404).json({ error: 'Username not found' });
      }
      
      // Get daily views - use a simpler aggregation to avoid issues
      const dailyViewsPromise = db.collection('counters').aggregate([
        { $match: { username } },
        { $unwind: '$views' },
        { $match: { 'views.timestamp': { $gte: daysAgo } } },
        { $group: {
            _id: { 
              $dateToString: { format: '%Y-%m-%d', date: '$views.timestamp' } 
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      // Get referrer stats with a simpler structure
      const referrersPromise = db.collection('counters').aggregate([
        { $match: { username } },
        { $unwind: '$views' },
        { $match: { 'views.timestamp': { $gte: daysAgo } } },
        { $group: {
            _id: '$views.referer',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();
      
      // Execute all promises
      const [dailyViews, referrers] = await Promise.all([
        dailyViewsPromise,
        referrersPromise
      ]);
      
      res.status(200).json({
        username,
        totalCount: result.count,
        lastUpdated: result.lastUpdated,
        dailyViews,
        topReferrers: referrers
      });
      
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return res.status(200).json({
        username,
        totalCount: 0,
        note: 'Limited data available due to database error'
      });
    }
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(200).json({ 
      error: 'Internal server error', 
      username: req.query.username || 'unknown',
      limitedData: true
    });
  }
};