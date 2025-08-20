# GitHub Setup for adarsh180

## 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Production-ready UPSC Tracker"
```

## 2. Create GitHub Repository
1. Go to https://github.com/adarsh180
2. Click "New repository"
3. Repository name: `upsc-tracker`
4. Description: `UPSC CSE Tracker - Modern full-stack web application for UPSC preparation with AI insights`
5. Set to Public
6. Don't initialize with README (we already have files)
7. Click "Create repository"

## 3. Connect and Push
```bash
git branch -M main
git remote add origin https://github.com/adarsh180/upsc-tracker.git
git push -u origin main
```

## 4. Vercel Deployment
1. Go to https://vercel.com
2. Import project from GitHub: `adarsh180/upsc-tracker`
3. Add environment variables:
   - `TIDB_HOST`
   - `TIDB_PORT`
   - `TIDB_USER` 
   - `TIDB_PASSWORD`
   - `TIDB_DATABASE`
   - `GROQ_API_KEY`
4. Deploy

## 5. Repository Settings
- Enable GitHub Actions for automated deployment
- Set branch protection rules for main branch
- Add repository topics: `upsc`, `nextjs`, `react`, `typescript`, `tidb`

Your project will be live at: `https://upsc-tracker-adarsh180.vercel.app`