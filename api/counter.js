// This file should be placed in /api/counter.js for Vercel serverless functions
const { MongoClient } = require('mongodb');

// Generate SVG counter
function generateCounterSVG(count, options = {}) {
  const {
    label = 'Profile Views',
    labelColor = '#555',
    countColor = '#007ec6',
    labelBgColor = '#eee',
    countBgColor = '#0476b5',
    style = 'flat',
    width = 120,
    height = 20,
    fontSize = 11,
  } = options;
  
  // Format large numbers with commas
  const formattedCount = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Calculate widths based on text
  const labelWidth = Math.max(70, label.length * 6);
  const countWidth = Math.max(30, formattedCount.length * 8);
  const totalWidth = labelWidth + countWidth;
  
  // Generate SVG based on style
  if (style === 'flat') {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}">
      <rect width="${labelWidth}" height="${height}" fill="${labelBgColor}"/>
      <rect x="${labelWidth}" width="${countWidth}" height="${height}" fill="${countBgColor}"/>
      <text x="${labelWidth / 2}" y="${height / 2 + 4}" font-family="Verdana,sans-serif" font-size="${fontSize}" fill="${labelColor}" text-anchor="middle">${label}</text>
      <text x="${labelWidth + countWidth / 2}" y="${height / 2 + 4}" font-family="Verdana,sans-serif" font-size="${fontSize}" font-weight="bold" fill="#fff" text-anchor="middle">${formattedCount}</text>
    </svg>
    `;
  } else if (style === 'plastic') {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}">
      <linearGradient id="a" x2="0" y2="100%">
        <stop offset="0" stop-color="#eee" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <rect rx="3" width="${totalWidth}" height="${height}" fill="#555"/>
      <rect rx="3" x="${labelWidth}" width="${countWidth}" height="${height}" fill="${countBgColor}"/>
      <path fill="${countBgColor}" d="M${labelWidth} 0h4v${height}h-4z"/>
      <rect rx="3" width="${totalWidth}" height="${height}" fill="url(#a)"/>
      <g fill="#fff" text-anchor="middle" font-family="Verdana,sans-serif" font-size="${fontSize}">
        <text x="${labelWidth / 2}" y="${height / 2 + 4}" fill="#000" fill-opacity=".3">${label}</text>
        <text x="${labelWidth / 2}" y="${height / 2 + 3}">${label}</text>
        <text x="${labelWidth + countWidth / 2}" y="${height / 2 + 4}" fill="#000" fill-opacity=".3">${formattedCount}</text>
        <text x="${labelWidth + countWidth / 2}" y="${height / 2 + 3}">${formattedCount}</text>
      </g>
    </svg>
    `;
  } else if (style === 'for-the-badge') {
    // All uppercase for this style
    const uppercaseLabel = label.toUpperCase();
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth + 10}" height="${height + 10}" viewBox="0 0 ${totalWidth + 10} ${height + 10}">
      <rect rx="4" width="${labelWidth + 5}" height="${height + 10}" fill="${labelBgColor}"/>
      <rect rx="4" x="${labelWidth + 5}" width="${countWidth + 5}" height="${height + 10}" fill="${countBgColor}"/>
      <path fill="${countBgColor}" d="M${labelWidth + 5} 0h4v${height + 10}h-4z"/>
      <g fill="#fff" text-anchor="middle" font-family="Verdana,sans-serif" font-size="${fontSize + 1}" font-weight="bold">
        <text x="${(labelWidth + 5) / 2}" y="${(height + 10) / 2 + 4}">${uppercaseLabel}</text>
        <text x="${labelWidth + 5 + (countWidth + 5) / 2}" y="${(height + 10) / 2 + 4}">${formattedCount}</text>
      </g>
    </svg>
    `;
  }
  
  // Default to flat style if unrecognized
  return generateCounterSVG(count, { ...options, style: 'flat' });
}

// MongoDB connection caching (important for serverless)
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // Use cached connection if available to improve performance
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Check for MongoDB URI
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in Vercel');
  }

  // Connect to MongoDB
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('profile-counter');
  
  // Cache the client and db connections
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

module.exports = async (req, res) => {
  try {
    // Extract query parameters
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).send(generateCounterSVG(0, { 
        label: 'Error', 
        countBgColor: '#e05d44' 
      }));
    }
    
    // Get style parameters
    const style = req.query.style || 'flat';
    const label = req.query.label || 'Profile Views';
    const color = req.query.color || '#007ec6';
    const noCount = req.query.nocount === 'true';
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Increment counter unless nocount is true (for debugging)
    let count = 0;
    
    if (!noCount) {
      // Store analytics data
      const timestamp = new Date();
      const userAgent = req.headers['user-agent'] || '';
      const referer = req.headers['referer'] || '';
      const ip = req.headers['x-forwarded-for'] || 
                req.headers['x-real-ip'] || 
                req.connection.remoteAddress;
      
      // Increment counter using MongoDB findOneAndUpdate
      const result = await db.collection('counters').findOneAndUpdate(
        { username },
        { 
          $inc: { count: 1 },
          $set: { lastUpdated: timestamp },
          $push: { 
            // Limit stored views to prevent database growth issues
            views: {
              $each: [{
                timestamp,
                userAgent,
                referer,
                ip: ip ? ip.split(',')[0].trim() : null
              }],
              $slice: -1000 // Keep only the most recent 1000 views
            }
          }
        },
        { 
          upsert: true,
          returnDocument: 'after'
        }
      );
      
      count = result.value?.count || 1;
    } else {
      // Just get the current count without incrementing
      const result = await db.collection('counters').findOne({ username });
      count = result?.count || 0;
    }
    
    // Set headers for SVG response
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Generate and send SVG
    const svg = generateCounterSVG(count, {
      label,
      countBgColor: color,
      style
    });
    
    res.send(svg);
    
  } catch (error) {
    console.error('Counter error:', error);
    res.status(500).send(generateCounterSVG(0, { 
      label: 'Error', 
      countBgColor: '#e05d44' 
    }));
  }
};