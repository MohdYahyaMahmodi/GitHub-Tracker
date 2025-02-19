# GitHub Tracker

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=flat&logo=vercel&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E)

![Profile Views](https://ghtb-counter.vercel.app/api/counter?username=MohdYahyaMahmodi&label=Profile%20Views&color=6366f1&style=flat)

A customizable, real-time profile view counter for your GitHub profiles and repositories. Add stylish badges to track and display visitor counts on your README files.

## 🌟 Features

- **Real-time Tracking**: Count profile and repository views as they happen
- **Fully Customizable**: Change colors, labels, and badge styles
- **Multiple Badge Styles**: Choose from flat, plastic, or for-the-badge styles
- **MongoDB Integration**: Reliable storage with MongoDB Atlas
- **Serverless Architecture**: Powered by Vercel for maximum performance

## 📊 Demo

Create your own badge at [https://ghtb-counter.vercel.app](https://ghtb-counter.vercel.app)

## 📋 Table of Contents

- [How It Works](#-how-it-works)
- [Installation](#-installation)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Deployment](#deployment)
- [API Reference](#-api-reference)
  - [Counter Endpoint](#counter-endpoint)
  - [Stats Endpoint](#stats-endpoint)
  - [Analytics Endpoint](#analytics-endpoint)
  - [Bulk Update Endpoint](#bulk-update-endpoint)
- [Badge Customization](#-badge-customization)
- [Contributing](#-contributing)
- [License](#-license)

## 🔍 How It Works

1. **Badge Generation**: When someone views your GitHub profile/repo with the badge embedded, a request is sent to our API
2. **View Counting**: The API processes the request, authenticates it, and increments your view counter in MongoDB
3. **SVG Rendering**: A customized SVG badge is generated and returned, displaying your current view count
4. **Caching**: Connection pooling and MongoDB caching prevent serverless cold starts

The system uses MongoDB to store view counts and metadata, with Vercel serverless functions handling the API endpoints.

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or newer)
- [Vercel CLI](https://vercel.com/cli)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### Environment Variables

The application requires the following environment variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `API_KEY` | Secret key for accessing analytics endpoints |

### Deployment

1. **Clone the repository**

```bash
git clone https://github.com/MohdYahyaMahmodi/GitHub-Tracker
cd GitHub-Tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up MongoDB Atlas**
   - Create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
   - Create a new cluster
   - Create a database named `profile-counter`
   - Create a user with read/write access to the database
   - Get your connection string from Atlas dashboard

4. **Deploy to Vercel**

```bash
vercel --prod --env MONGODB_URI="mongodb+srv://username:password@your-cluster.mongodb.net/profile-counter?retryWrites=true&w=majority" --env API_KEY="your-secret-api-key"
```

Replace the connection string and API key with your actual values.

5. **Verify deployment**

Visit your Vercel deployment URL to confirm everything is working.

## 📝 API Reference

### Counter Endpoint

```
GET /api/counter
```

Generates and returns an SVG badge while incrementing the view counter.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `username` | string | **Required**. GitHub username or repository |
| `label` | string | Label text (default: "Profile Views") |
| `color` | string | Count background color (hex without #) |
| `labelColor` | string | Label text color (hex without #) |
| `labelBgColor` | string | Label background color (hex without #) |
| `countColor` | string | Count text color (hex without #) |
| `style` | string | Badge style: flat, plastic, or for-the-badge |
| `noCount` | boolean | If true, view is not counted (for preview) |

**Example:**
```
/api/counter?username=MohdYahyaMahmodi&label=Profile%20Views&color=6366f1&style=flat
```

### Stats Endpoint

```
GET /api/stats
```

Returns current view count and last updated time for a username.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `username` | string | **Required**. GitHub username or repository |

**Response:**
```json
{
  "username": "MohdYahyaMahmodi",
  "count": 1234,
  "lastUpdated": "2025-02-15T12:34:56.789Z"
}
```

### Analytics Endpoint

```
GET /api/analytics
```

Returns detailed analytics for a username (requires API key).

**Headers:**
- `X-API-Key`: Your API key

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `username` | string | **Required**. GitHub username or repository |
| `days` | number | Number of days of data to return (default: 30) |

**Response:**
```json
{
  "username": "MohdYahyaMahmodi",
  "totalCount": 1234,
  "lastUpdated": "2025-02-15T12:34:56.789Z",
  "dailyViews": [
    {"_id": "2025-02-01", "count": 42},
    {"_id": "2025-02-02", "count": 37}
  ],
  "topReferrers": [
    {"_id": "github.com", "count": 853},
    {"_id": "google.com", "count": 215}
  ]
}
```

### Bulk Update Endpoint

```
POST /api/bulk-update
```

Performs multiple view count updates (for testing purposes).

**Request Body:**
```json
{
  "username": "MohdYahyaMahmodi",
  "updateCount": 10,
  "delay": 300
}
```

## 🎨 Badge Customization

You can customize your badge in several ways:

### Style Options

| Style | Example |
|-------|---------|
| `flat` | ![Flat](https://img.shields.io/badge/style-flat-blue?style=flat) |
| `plastic` | ![Plastic](https://img.shields.io/badge/style-plastic-blue?style=plastic) |
| `for-the-badge` | ![For The Badge](https://img.shields.io/badge/STYLE-FOR_THE_BADGE-blue?style=for-the-badge) |

### Color Options

You can specify colors using hex codes (without #) or named colors:
- blue
- green
- red
- yellow
- orange
- purple
- black
- gray

### Markdown Implementation

Add this to your GitHub README.md:

```markdown
![Profile Views](https://ghtb-counter.vercel.app/api/counter?username=yourusername&label=Profile%20Views&color=6366f1&style=flat)
```

### HTML Implementation

```html
<img src="https://ghtb-counter.vercel.app/api/counter?username=yourusername&label=Profile%20Views&color=6366f1&style=flat" alt="Profile Views" />
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📁 Project Structure

```
GitHub-Tracker/
├── api/
│   ├── counter.js       # Main counter endpoint
│   ├── stats.js         # Stats retrieval endpoint
│   ├── analytics.js     # Detailed analytics endpoint
│   └── bulk-update.js   # Bulk update endpoint for testing
├── public/
│   ├── index.html       # Main web interface
│   ├── styles.css       # Styling for web interface
│   ├── script.js        # Frontend JavaScript
│   └── favicon.ico      # Site favicon
├── package.json         # Project dependencies
├── vercel.json          # Vercel configuration
└── README.md            # Project documentation
```

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Errors**
- Verify your IP address is whitelisted in MongoDB Atlas
- Confirm connection string format is correct
- Ensure database user has appropriate permissions

**Badge Not Updating**
- GitHub caches images. Add a query parameter like `?t=123` to force refresh
- Check console for any API errors
- Verify username is correctly specified

**Deployment Issues**
- Ensure all environment variables are properly set
- Check Vercel deployment logs for errors
- Verify Node.js version compatibility

For more help, please open an issue on the GitHub repository.