# Database Cleanup Instructions

## Issue
The essay, current affairs, and optional progress tables need to be recreated with proper unique constraints to fix data persistence issues.

## Solution
Run this command to clean up and recreate the database tables:

```bash
curl -X POST http://localhost:3000/api/cleanup-db
```

Or visit this URL in your browser:
```
http://localhost:3000/api/cleanup-db
```

## What This Does
1. Drops existing tables: `essay_progress`, `current_affairs`, `optional_progress`
2. Recreates them with proper UNIQUE constraints
3. Fixes the data persistence issues

## After Running Cleanup
1. Your progress data will be reset to zero (this is expected)
2. Manual saving will now work correctly
3. Data will persist between page refreshes and sign-ins
4. Dashboard cards will update in real-time

## Test the Fix
1. Go to Essay page → Make changes → Save → Refresh → Data should persist
2. Go to Current Affairs page → Make changes → Save → Refresh → Data should persist  
3. Go to Optional page → Make changes → Save → Refresh → Data should persist
4. Dashboard cards should show real-time progress updates