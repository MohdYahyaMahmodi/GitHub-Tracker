// This file should be placed in /api/stats.js
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

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    try {
      const { db } = await connectToDatabase();
      
      const result = await db.collection('counters').findOne(
        { username },
        { projection: { _id: 0, username: 1, count: 1, lastUpdated: 1 }}
      );
      
      if (!result) {
        // Return default data structure with count 0 instead of an error
        return res.status(200).json({
          username,
          count: 0,
          lastUpdated: null
        });
      }
      
      return res.status(200).json(result);
      
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      
      // Return a default response even when DB fails
      return res.status(200).json({
        username,
        count: 0,
        lastUpdated: null,
        error: 'Database error'
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(200).json({ 
      error: 'Internal server error',
      username: req.query.username || 'unknown',
      count: 0
    });
  }
};