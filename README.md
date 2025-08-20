# UPSC CSE Tracker

A modern full-stack web application for UPSC Civil Services Examination preparation with AI-powered insights and real-time progress tracking.

## Features

### 🎯 Core Functionality
- **Real-time Progress Tracking**: Track lectures, DPPs, tests, essays, and current affairs
- **Dynamic Checkboxes**: Subject-wise progress with persistent state
- **Test Analytics**: Performance trends with interactive charts
- **Daily Goals**: Study session tracking with trend analysis
- **AI Insights**: Personalized recommendations via Groq AI

### 🎨 UI/UX
- **Dark Theme + Glassmorphism**: Modern glass-effect cards with neon highlights
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Interactive Charts**: Recharts for data visualization

### 📊 Dashboard Sections
- **GS1-4**: Subject-wise tracking for all General Studies papers
- **CSAT**: Quantitative Aptitude, Logical Reasoning, Reading Comprehension
- **Optional**: 4 sections with 140 checkboxes each
- **Current Affairs**: 300 topic tracking
- **Essay**: Lecture and essay writing progress
- **Tests**: Prelims and Mains test performance analysis

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS, Framer Motion
- **Charts**: Recharts
- **Database**: TiDB (MySQL compatible)
- **AI**: Groq API for insights
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- TiDB database instance
- Groq API key

### Installation

1. **Clone and install dependencies**:
```bash
cd upsc-tracker
npm install
```

2. **Environment Setup**:
Create `.env.local` with your credentials:
```env
TIDB_HOST=your_tidb_host
TIDB_PORT=4000
TIDB_USER=your_username
TIDB_PASSWORD=your_password
TIDB_DATABASE=upsc_tracker
GROQ_API_KEY=your_groq_api_key
```

3. **Initialize Database**:
The app will automatically create tables and seed default data on first run.

4. **Start Development Server**:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
upsc-tracker/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Landing page
├── components/            # Reusable components
├── lib/                  # Utilities and database
├── types/                # TypeScript definitions
└── public/               # Static assets
```

## Key Features Explained

### 🔄 Real-time Sync
Every checkbox tick and progress update is immediately stored in TiDB and reflected across the dashboard.

### 📈 Analytics
- Subject-wise completion percentages
- Test performance trends
- Daily study hour tracking
- Category-wise test analysis

### 🤖 AI Integration
Groq AI provides:
- Personalized study recommendations
- Performance analysis
- Subject-specific insights

### ⏰ Exam Countdown
Live countdown timers for:
- UPSC CSE Prelims: 24 May 2026
- UPSC CSE Mains: 21 Aug 2026

## API Endpoints

- `GET/POST/PUT /api/subjects` - Subject progress management
- `GET/POST /api/tests` - Test records management  
- `GET/POST /api/goals` - Daily goals tracking
- `POST /api/init` - Database initialization

## Database Schema

### Tables
- `users` - User information
- `subject_progress` - Subject-wise tracking
- `test_records` - Test performance data
- `current_affairs` - Current affairs progress
- `essay_progress` - Essay writing tracking
- `daily_goals` - Daily study sessions

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Ensure all environment variables are set in your production environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.

---

**Happy Studying! 🎓**