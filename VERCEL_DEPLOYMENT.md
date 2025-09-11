# Vercel Deployment Guide for Rockfall Dashboard

## Prerequisites

1. **GitHub Account** - Your code should be pushed to a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Gemini API Key** - Get one from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
# If not already done, initialize git repository
git init
git add .
git commit -m "Initial commit with Vercel configuration"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/rockfall-dashboard.git
git branch -M main
git push -u origin main
```

### 1.2 Environment Variables Setup
1. Copy `.env.example` to `.env.local` for local development:
   ```bash
   cp .env.example .env.local
   ```
2. Add your Gemini API key to `.env.local`:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select the `rockfall-dashboard` repository

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `dist` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)

4. **Set Environment Variables**
   - In the "Environment Variables" section, add:
     - **Name**: `VITE_GEMINI_API_KEY`
     - **Value**: Your Gemini API key
     - **Environment**: Production, Preview, Development (select all)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # From your project directory
   vercel

   # Follow the prompts:
   # - Set up and deploy? Yes
   # - Which scope? Select your account
   # - Link to existing project? No
   # - What's your project's name? rockfall-dashboard
   # - In which directory is your code located? ./
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_GEMINI_API_KEY
   # Enter your Gemini API key when prompted
   # Select: Production, Preview, Development
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## Step 3: Verify Deployment

1. **Test the Application**
   - Visit your Vercel URL (e.g., `https://rockfall-dashboard-xxx.vercel.app`)
   - Test the image analysis feature to ensure Gemini API is working
   - Check that all pages load correctly
   - Verify responsive design on mobile devices

2. **Check Build Logs**
   - If there are issues, check the build logs in Vercel dashboard
   - Common issues and solutions are listed below

## Step 4: Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your project settings in Vercel
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Vercel automatically provides SSL certificates
   - Your site will be available over HTTPS

## Step 5: Continuous Deployment

Once set up, Vercel will automatically:
- Deploy when you push to the `main` branch
- Create preview deployments for pull requests
- Provide deployment previews for each commit

## Common Issues and Solutions

### 1. Build Fails - TypeScript Errors
```bash
# Fix TypeScript errors locally first
npm run build

# If successful locally but fails on Vercel, check Node.js version
# Vercel uses Node.js 18.x by default
```

### 2. Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Check that variables are set for the correct environment
- Redeploy after adding environment variables

### 3. API Key Issues
- Verify your Gemini API key is valid
- Check API quota and billing in Google AI Studio
- Ensure the key has proper permissions

### 4. Large Bundle Size Warning
The build includes bundle size optimization in `vite.config.ts`:
- Chunks are split by vendor, UI, maps, AI, charts, and utils
- Warning limit is set to 1000KB
- Consider lazy loading components if needed

### 5. Route Issues (404 on Refresh)
The `vercel.json` configuration handles SPA routing:
- All routes redirect to `index.html`
- Static assets are served with proper caching headers

## Performance Optimizations

### 1. Caching Strategy
- Static assets: 1 year cache (configured in `vercel.json`)
- HTML: No cache (for latest updates)
- API responses: Consider adding cache headers

### 2. Image Optimization
- Use Vercel's image optimization for uploaded images
- Consider WebP format for better compression
- Implement lazy loading for images

### 3. Bundle Optimization
- Code splitting is configured in `vite.config.ts`
- Consider dynamic imports for large components
- Monitor bundle size with Vercel analytics

## Monitoring and Analytics

### 1. Vercel Analytics
- Enable in project settings for performance insights
- Monitor Core Web Vitals
- Track deployment success rates

### 2. Error Monitoring
- Consider integrating Sentry or similar service
- Monitor API errors and user feedback
- Set up alerting for critical issues

## Environment-Specific Configurations

### Development
```bash
# Local development
npm run dev
# Accessible at http://localhost:5173
```

### Preview
```bash
# Preview production build locally
npm run build
npm run preview
# Accessible at http://localhost:4173
```

### Production
- Deployed automatically to Vercel
- Environment variables from Vercel dashboard
- Optimized build with code splitting

## Security Considerations

1. **API Key Protection**
   - Never commit API keys to repository
   - Use environment variables for all secrets
   - Rotate API keys regularly

2. **CORS and Security Headers**
   - Vercel provides security headers by default
   - Consider adding CSP headers if needed
   - Monitor for XSS and injection attacks

3. **Rate Limiting**
   - Monitor Gemini API usage
   - Implement client-side rate limiting if needed
   - Consider adding server-side API proxying

## Support and Troubleshooting

### Vercel Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)

### Project-Specific Help
- Check GitHub Issues for common problems
- Review build logs in Vercel dashboard
- Test locally before deploying

### Contact Information
- Create GitHub issues for bugs
- Check deployment status at [Vercel Status](https://vercel-status.com)

## Deployment Checklist

- [ ] Code pushed to GitHub repository
- [ ] Vercel project created and connected
- [ ] Environment variables configured
- [ ] First deployment successful
- [ ] All features tested in production
- [ ] Custom domain configured (if applicable)
- [ ] Analytics and monitoring set up
- [ ] Team access configured (if applicable)
- [ ] Backup and recovery plan documented

## Next Steps After Deployment

1. **Share Access**
   - Add team members in Vercel dashboard
   - Configure appropriate permissions
   - Share production URL with stakeholders

2. **Performance Monitoring**
   - Set up regular performance checks
   - Monitor API usage and costs
   - Plan for scaling as usage grows

3. **Feature Development**
   - Use preview deployments for new features
   - Test changes in staging environment
   - Plan release schedule and versioning

Your Rockfall Dashboard is now ready for production use on Vercel! 🚀
