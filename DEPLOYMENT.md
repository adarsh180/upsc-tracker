# Production Deployment Guide

## Vercel Deployment

### 1. Environment Variables Setup
Add these environment variables in Vercel dashboard:

```
TIDB_HOST=your_tidb_host
TIDB_PORT=4000
TIDB_USER=your_username
TIDB_PASSWORD=your_password
TIDB_DATABASE=upsc_tracker
GROQ_API_KEY=your_groq_api_key
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Custom Domain (Optional)
- Add your domain in Vercel dashboard
- Configure DNS records as instructed

## GitHub Setup

### 1. Create Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/upsc-tracker.git
git push -u origin main
```

### 2. Connect to Vercel
- Import project from GitHub in Vercel dashboard
- Configure environment variables
- Deploy automatically on push

## Production Checklist

- [x] Environment variables configured
- [x] Database connection optimized
- [x] Build process validated
- [x] Error handling implemented
- [x] Performance optimizations applied
- [x] Security headers configured
- [x] Git repository setup
- [x] Vercel deployment ready

## Performance Features

- Server-side rendering (SSR)
- Static generation where possible
- Database connection pooling
- Compressed responses
- Optimized images
- Minimal bundle size

## Security Features

- Environment variables protection
- SQL injection prevention
- CORS configuration
- Security headers
- Input validation