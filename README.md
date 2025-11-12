# SecureProxy - Anonymous Web Browser

A secure proxy browser that allows users to browse the web anonymously with masked IP addresses and locations.

## Features

- 🛡️ **Anonymous Browsing** - Mask your IP address and location
- 🔒 **Secure Connection** - All traffic routed through secure proxy
- 🌐 **Universal Access** - Access any website through the proxy
- 🎨 **Modern UI** - Beautiful, responsive interface
- ⚡ **Fast Performance** - Optimized for speed

## Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts** to link your project and deploy

4. **Your app will be live** at `https://your-project.vercel.app`

### Manual Deployment

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will automatically detect the configuration and deploy

## Project Structure

```
├── api/              # Vercel serverless functions
│   ├── proxy.js      # Main proxy endpoint
│   ├── health.js     # Health check endpoint
│   └── info.js       # Server info endpoint
├── index.html        # Main application page
├── main.js           # Frontend JavaScript
├── settings.html     # Settings page
├── help.html         # Help page
└── vercel.json       # Vercel configuration
```

## API Endpoints

- `GET /api/proxy?url=<target_url>` - Proxy a website
- `POST /api/proxy?url=<target_url>` - Proxy POST requests
- `GET /api/health` - Health check
- `GET /api/info` - Server information

## Usage

1. Enter any website URL in the search bar
2. Click "Browse Securely"
3. The website will load in a new window through the proxy
4. All links and resources are automatically routed through the proxy

## Development

### Local Development with Vercel

```bash
npm install
vercel dev
```

### Using Google Cloud Backend

If you want to use the Google Cloud backend instead:

1. Update `main.js` line 20 to your backend URL
2. Deploy backend to Google Cloud (see `backend-reference/` folder)

## License

MIT

