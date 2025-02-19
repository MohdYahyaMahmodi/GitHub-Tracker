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

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('profile-counter');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
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
    
    const { db } = await connectToDatabase();
    const result = await db.collection('counters').findOne(
      { username },
      { projection: { _id: 0, username: 1, count: 1, lastUpdated: 1 }}
    );
    
    if (!result) {
      return res.json({
        username,
        count: 0,
        lastUpdated: null
      });
    }
    
    return res.json(result);
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};