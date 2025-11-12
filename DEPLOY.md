# Deploying SecureProxy to Vercel

## Quick Deploy

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if you haven't already):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to your project**:
   ```bash
   cd /Users/omar/Desktop/side-projects/secureproxy-files
   ```

4. **Deploy**:
   ```bash
   vercel
   ```

5. **Follow the prompts**:
   - Set up and deploy? **Yes**
   - Which scope? (Choose your account)
   - Link to existing project? **No** (for first time)
   - Project name? (Press Enter for default or enter a name)
   - Directory? **./** (current directory)

6. **Your app will be live!** You'll get a URL like `https://secureproxy-xxx.vercel.app`

### Option 2: Using GitHub + Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Vercel will auto-detect settings** - just click "Deploy"

6. **Done!** Your app will be live in ~2 minutes

## After Deployment

✅ **Yes, others can use it!** Once deployed, your app will be publicly accessible at your Vercel URL.

### Share Your App

Your app will be available at:
- Production: `https://your-project-name.vercel.app`
- Preview deployments: `https://your-project-name-git-branch-username.vercel.app`

### Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Important Notes

⚠️ **Vercel Free Tier Limits:**
- Function execution: 10 seconds (Hobby plan)
- Bandwidth: 100GB/month
- Requests: Unlimited

💡 **For production use**, consider:
- Vercel Pro plan (60s execution time, better performance)
- Or keep using Google Cloud backend for unlimited execution time

## Testing Locally

Test before deploying:

```bash
npm install
vercel dev
```

Then visit `http://localhost:3000`

## Troubleshooting

### Function Timeout
If you get timeout errors, the site might be taking too long to load. Vercel has a 10s limit on the free tier.

**Solution**: Upgrade to Pro plan or use Google Cloud backend for longer timeouts.

### CORS Errors
The API endpoints have CORS enabled, so this shouldn't be an issue. If you see CORS errors, check that the frontend is using the correct API path (`/api/proxy`).

## Switching Between Backends

The frontend automatically detects if it's on Vercel:
- **On Vercel**: Uses `/api/proxy` endpoints
- **Local/Google Cloud**: Uses `http://35.196.124.59:3000/proxy`

You can manually override in `main.js` line 20-27.

