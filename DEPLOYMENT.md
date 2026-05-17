# Deployment Guide - Galaxy Simulation

## 🚀 Deploy to Netlify

### Method 1: Automatic Deploy from GitHub (Recommended)

1. **Login to Netlify**
   - Go to https://app.netlify.com/
   - Login with your GitHub account

2. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Select repository: `PebiHeriansyah/Galaxy`

3. **Build Settings** (Auto-detected from netlify.toml)
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

4. **Wait for Build**
   - Netlify will automatically:
     - Install dependencies (`npm install`)
     - Build project (`npm run build`)
     - Deploy to CDN
   - Build time: ~2-3 minutes

5. **Done!**
   - Your site will be live at: `https://random-name.netlify.app`
   - You can change the domain name in Site settings

### Method 2: Manual Deploy (Drag & Drop)

1. **Build Locally**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy dist folder**
   - Go to https://app.netlify.com/drop
   - Drag the `dist` folder to the upload area
   - Wait for deployment

3. **Done!**
   - Site will be live immediately

## 🔧 Netlify Configuration

The `netlify.toml` file contains:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### What this does:
- **command**: Runs webpack production build
- **publish**: Serves files from `dist` folder
- **redirects**: Ensures SPA routing works correctly

## 📦 Build Output

After running `npm run build`, you'll get:

```
dist/
├── bundle.[hash].js       # Minified JavaScript (597 KB)
├── bundle.[hash].js.map   # Source map for debugging
├── bundle.[hash].js.LICENSE.txt  # Third-party licenses
└── index.html             # Entry HTML file
```

## ⚡ Performance Notes

### Bundle Size Warning
You may see webpack warnings about bundle size (597 KB). This is expected because:
- Three.js library is large (~500 KB)
- 355,000 particles require significant code
- All shaders are included

### Optimization Tips
1. **Enable Gzip** (Netlify does this automatically)
   - Reduces 597 KB → ~150 KB transferred
2. **Use CDN** (Netlify provides this)
   - Fast global delivery
3. **Browser Caching** (Configured in webpack)
   - Hash-based filenames for cache busting

## 🌐 Custom Domain

### Add Custom Domain on Netlify

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `galaxy.yourdomain.com`)
4. Follow DNS configuration instructions
5. Netlify will auto-provision SSL certificate

### DNS Configuration Example

For subdomain (e.g., `galaxy.yourdomain.com`):
```
Type: CNAME
Name: galaxy
Value: your-site-name.netlify.app
```

For root domain (e.g., `yourdomain.com`):
```
Type: A
Name: @
Value: 75.2.60.5 (Netlify's load balancer)
```

## 🔄 Continuous Deployment

Once connected to GitHub, Netlify will automatically:
- Deploy on every push to `main` branch
- Build preview for pull requests
- Show build logs and errors
- Rollback to previous versions if needed

### Trigger Manual Deploy
```bash
git add .
git commit -m "Update galaxy parameters"
git push
```
Netlify will detect the push and rebuild automatically.

## 🐛 Troubleshooting

### Build Fails on Netlify

**Problem**: "Module not found" or "Command not found"

**Solution**:
1. Check `package.json` has all dependencies
2. Ensure Node version compatibility
3. Check build logs on Netlify dashboard

### Site Shows Blank Page

**Problem**: White screen, no errors in console

**Solution**:
1. Check browser console for errors
2. Verify `dist/index.html` exists
3. Check if JavaScript is loading (Network tab)
4. Try hard refresh (Ctrl+F5)

### WebGL Not Working

**Problem**: "WebGL not supported" error

**Solution**:
- This is user's browser issue
- Requires modern browser with WebGL 2.0
- Check: https://get.webgl.org/

### Performance Issues

**Problem**: Low FPS on deployed site

**Solution**:
1. Reduce particle count in GUI
2. Check if user has GPU acceleration enabled
3. Test on different devices

## 📊 Monitoring

### Netlify Analytics (Optional)
- Enable in Site settings → Analytics
- Track page views, bandwidth, performance
- Costs $9/month

### Free Alternatives
- Google Analytics
- Plausible Analytics
- Simple Analytics

## 🔐 Environment Variables

If you need API keys or secrets:

1. Go to Site settings → Environment variables
2. Add variables (e.g., `API_KEY`)
3. Access in code: `process.env.API_KEY`
4. Rebuild site for changes to take effect

## 📝 Build Commands Reference

```bash
# Development server
npm run dev

# Production build
npm run build

# Test build locally
npm install -g serve
serve -s dist
```

## 🎯 Deployment Checklist

Before deploying:
- [ ] Test locally with `npm run dev`
- [ ] Build successfully with `npm run build`
- [ ] Check `dist` folder has all files
- [ ] Test production build locally
- [ ] Commit and push to GitHub
- [ ] Verify Netlify build succeeds
- [ ] Test deployed site on multiple devices
- [ ] Check WebGL compatibility
- [ ] Monitor performance (FPS)

## 🌟 Post-Deployment

After successful deployment:
1. Share your link: `https://your-site.netlify.app`
2. Update README with live demo link
3. Add screenshot to repository
4. Share on social media
5. Monitor analytics and performance

---

**Need Help?**
- Netlify Docs: https://docs.netlify.com/
- Netlify Support: https://answers.netlify.com/
- GitHub Issues: https://github.com/PebiHeriansyah/Galaxy/issues
