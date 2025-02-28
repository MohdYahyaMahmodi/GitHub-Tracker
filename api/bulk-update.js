// This file should be placed in /api/bulk-update.js
const { MongoClient } = require('mongodb');
const axios = require('axios');

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

// Helper function for various user agents to simulate different browsers
function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
  ];
  
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    const { username, updateCount, delay = 300 } = req.body;
    
    if (!username || !updateCount || updateCount <= 0 || updateCount > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid username and update count (1-1000)' 
      });
    }
    
    // Ensure delay is reasonable (between 200-1000ms)
    const safeDelay = Math.max(200, Math.min(1000, delay));
    
    // Get the current base URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (req.headers.host ? `https://${req.headers.host}` : 'https://ghtb-profile-counter.vercel.app');
    
    const counterUrl = `${baseUrl}/api/counter?username=${encodeURIComponent(username)}`;
    let successCount = 0;
    let failCount = 0;
    
    try {
      const { db } = await connectToDatabase();
      
      // Record this bulk update operation for auditing purposes
      await db.collection('bulk_updates').insertOne({
        username,
        requestedUpdates: updateCount,
        timestamp: new Date(),
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });
    } catch (dbError) {
      console.error('Database audit log error:', dbError);
      // Continue even if audit logging fails
    }
    
    // Sequential requests to avoid overwhelming the service
    for (let i = 0; i < updateCount; i++) {
      try {
        await axios.get(counterUrl, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        successCount++;
        
        // Small delay to prevent overwhelming the service
        await new Promise(resolve => setTimeout(resolve, safeDelay));
      } catch (err) {
        console.error(`Failed request ${i+1}:`, err.message);
        failCount++;
        // Still wait between requests even on failure
        await new Promise(resolve => setTimeout(resolve, safeDelay));
      }
    }
    
    return res.status(200).json({
      success: true,
      username,
      requestedUpdates: updateCount,
      successfulUpdates: successCount,
      failedUpdates: failCount,
      delay: safeDelay
    });
    
  } catch (error) {
    console.error('Error performing bulk update:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during bulk update' 
    });
  }
};