# Profile Counter

An open-source profile view counter that generates customizable SVG badges for GitHub profiles and repositories.

## Features

- 🚀 Fast, serverless implementation for Vercel
- 🎨 Customizable badges with different styles, colors and labels
- 📊 View count tracking with analytics
- 🔒 Privacy-respecting analytics
- 💾 MongoDB integration for reliable data storage
- 🌐 API endpoints for programmatic access

## Usage

Add this to your GitHub profile README.md:

```markdown
![Profile Views](https://your-vercel-app.vercel.app/api/counter?username=your-github-username)
```

### Customization Options

You can customize your counter with query parameters:

```markdown
![Profile Views](https://your-vercel-app.vercel.app/api/counter?username=your-github-username&label=visitors&color=blue&style=plastic)
```

### Available Parameters

| Parameter | Description | Default | Examples |
|-----------|-------------|---------|----------|
| `username` | Your GitHub username (required) | - | `your-github-username` |
| `label` | Text label for the counter | "Profile Views" | "visitors", "views" |
| `color` | Color of the count section | "#007ec6" | "blue", "green", "#ff0000" |
| `style` | Badge style | "flat" | "flat", "plastic", "for-the-badge" |
| `nocount` | Don't increment counter (for testing) | false | "true" |

### Styles Preview

#### Flat (default)
![Flat Style](https://img.shields.io/badge/Profile%20Views-1024-blue?style=flat)

#### Plastic
![Plastic Style](https://img.shields.io/badge/Profile%20Views-1024-blue?style=plastic)

#### For The Badge
![For The Badge Style](https://img.shields.io/badge/PROFILE%20VIEWS-1024-blue?style=for-the-badge)

## API Endpoints

### Get Counter Badge
```
GET /api/counter?username=<username>
```
Returns an SVG badge with the current count.

### Get Stats
```
GET /api/stats?username=<username>
```
Returns JSON with the current count and last update time.

### Analytics (Authenticated)
```
GET /api/analytics?username=<username>&days=30
```
Returns detailed analytics including daily views, referrers, and user agents.
Requires API key authentication.

### Bulk Update
```
POST /api/bulk-update
{
  "username": "github-username",
  "updateCount": 100,
  "delay": 300
}
```
Performs bulk updates for batch processing or migration purposes.

## Deployment

### Prerequisites
- Vercel account
- MongoDB database (MongoDB Atlas free tier works great)
- Node.js and npm for local development

### Setup

1. Fork this repository
2. Create a MongoDB Atlas cluster and get your connection string
3. Set up Vercel environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `API_KEY`: A secret key for accessing analytics

4. Deploy to Vercel:
```bash
vercel login
vercel
```

## Local Development

1. Clone the repository
```bash
git clone https://github.com/yourusername/profile-counter.git
cd profile-counter
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file with your MongoDB URI and API key
```
MONGODB_URI=mongodb+srv://...
API_KEY=your-secret-key
```

4. Run the development server
```bash
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.