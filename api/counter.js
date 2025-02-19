// This file should be placed in /api/counter.js
const { MongoClient } = require('mongodb');

// Generate SVG counter
function generateCounterSVG(count, options = {}) {
  const {
    label = 'Profile Views',
    labelColor = '#555',
    countColor = '#fff',  // Text color for count
    labelBgColor = '#eee',
    countBgColor = '#007ec6',  // Count background color
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
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}">
      <rect width="${labelWidth}" height="${height}" fill="${labelBgColor}"/>
      <rect x="${labelWidth}" width="${countWidth}" height="${height}" fill="${countBgColor}"/>
      <text x="${labelWidth / 2}" y="${height / 2 + 4}" font-family="Verdana,sans-serif" font-size="${fontSize}" fill="${labelColor}" text-anchor="middle">${label}</text>
      <text x="${labelWidth + countWidth / 2}" y="${height / 2 + 4}" font-family="Verdana,sans-serif" font-size="${fontSize}" font-weight="bold" fill="${countColor}" text-anchor="middle">${formattedCount}</text>
    </svg>`;
  } else if (style === 'plastic') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}">
      <linearGradient id="a" x2="0" y2="100%">
        <stop offset="0" stop-color="#eee" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <rect rx="3" width="${totalWidth}" height="${height}" fill="${labelBgColor}"/>
      <rect rx="3" x="${labelWidth}" width="${countWidth}" height="${height}" fill="${countBgColor}"/>
      <path fill="${countBgColor}" d="M${labelWidth} 0h4v${height}h-4z"/>
      <rect rx="3" width="${totalWidth}" height="${height}" fill="url(#a)"/>
      <g text-anchor="middle" font-family="Verdana,sans-serif" font-size="${fontSize}">
        <text x="${labelWidth / 2}" y="${height / 2 + 4}" fill="#000" fill-opacity=".3">${label}</text>
        <text x="${labelWidth / 2}" y="${height / 2 + 3}" fill="${labelColor}">${label}</text>
        <text x="${labelWidth + countWidth / 2}" y="${height / 2 + 4}" fill="#000" fill-opacity=".3">${formattedCount}</text>
        <text x="${labelWidth + countWidth / 2}" y="${height / 2 + 3}" fill="${countColor}">${formattedCount}</text>
      </g>
    </svg>`;
  } else if (style === 'for-the-badge') {
    // All uppercase for this style
    const uppercaseLabel = label.toUpperCase();
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth + 10}" height="${height + 10}" viewBox="0 0 ${totalWidth + 10} ${height + 10}">
      <rect rx="4" width="${labelWidth + 5}" height="${height + 10}" fill="${labelBgColor}"/>
      <rect rx="4" x="${labelWidth + 5}" width="${countWidth + 5}" height="${height + 10}" fill="${countBgColor}"/>
      <path fill="${countBgColor}" d="M${labelWidth + 5} 0h4v${height + 10}h-4z"/>
      <g text-anchor="middle" font-family="Verdana,sans-serif" font-size="${fontSize + 1}" font-weight="bold">
        <text x="${(labelWidth + 5) / 2}" y="${(height + 10) / 2 + 4}" fill="${labelColor}">${uppercaseLabel}</text>
        <text x="${labelWidth + 5 + (countWidth + 5) / 2}" y="${(height + 10) / 2 + 4}" fill="${countColor}">${formattedCount}</text>
      </g>
    </svg>`;
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

// Helper functions for color handling
function isValidHexColor(color) {
  return /^[0-9A-F]{3,6}$/i.test(color);
}

function formatColor(color) {
  if (!color) return '#007ec6'; // Default blue
  
  // Handle colors without hash
  if (color.charAt(0) !== '#') {
    // Check if it's a valid hex color without the #
    if (isValidHexColor(color)) {
      return `#${color}`;
    }
    
    // Named colors dictionary
    const namedColors = {
      'blue': '#007ec6',
      'green': '#28a745',
      'red': '#dc3545',
      'yellow': '#ffc107',
      'orange': '#fd7e14',
      'purple': '#6f42c1',
      'black': '#000000',
      'gray': '#6c757d'
    };
    
    return namedColors[color.toLowerCase()] || '#007ec6';
  }
  
  return color;
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
    
    // Parse all color parameters
    const countBgColor = formatColor(req.query.color || req.query.countBgColor || '007ec6');
    const labelColor = formatColor(req.query.labelColor || '555');
    const countColor = formatColor(req.query.countColor || 'fff');
    const labelBgColor = formatColor(req.query.labelBgColor || 'eee');
    
    // Extract client IP (used for logging purposes)
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               '0.0.0.0';
    
    let count = 0;
    // Always count the view on every request (rate limiting removed)
    const shouldCount = true;
    
    try {
      // Connect to database
      const { db } = await connectToDatabase();
      
      // Get current count first (we'll need it regardless)
      const currentDoc = await db.collection('counters').findOne({ username });
      count = currentDoc?.count || 0;
      
      // Increment counter since shouldCount is always true
      if (shouldCount) {
        // Store analytics data
        const timestamp = new Date();
        const userAgent = req.headers['user-agent'] || '';
        const referer = req.headers['referer'] || '';
        
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
        
        // Use the updated count if available
        if (result?.value?.count !== undefined) {
          count = result.value.count;
        } else {
          // Otherwise, increment our local count since we know we successfully updated
          count += 1;
        }
      }
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      // We already have count from earlier query or it defaulted to 0
    }
    
    // Set headers for SVG response
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Generate and send SVG with all the formatted colors
    const svg = generateCounterSVG(count, {
      label,
      labelColor,
      countColor, 
      labelBgColor,
      countBgColor,
      style
    });
    
    res.status(200).send(svg);
    
  } catch (error) {
    console.error('Counter error:', error);
    // Return an error badge
    res.status(200).send(generateCounterSVG(0, { 
      label: 'Error', 
      countBgColor: '#e05d44' 
    }));
  }
};
