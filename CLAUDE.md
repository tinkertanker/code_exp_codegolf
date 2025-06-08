# Mini Code Golf - Lightweight Specification

## Overview
A lightweight web app for team-based code golf competitions with Supabase backend. Teams approach terminals, enter their name, solve Fizz Buzz, and compete on a leaderboard.

## Selected Problem: Fizz Buzz
Print numbers 1 to 100, but replace multiples of 3 with "Fizz", multiples of 5 with "Buzz", and multiples of both with "FizzBuzz".

## Tech Stack (Lightweight)
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (database + edge functions for code execution)
- **Styling**: Tailwind CSS
- **Code Execution**: Supabase Edge Functions with Deno runtime

## Two Separate Modes

### Mode 1: Team Challenge Mode (for participants)
#### Team Entry View
- Category selector (1 or 2)
- Team number input field
- Language selector (Python/JavaScript)
- "Start Challenge" button

#### Challenge View
- Timer display at top (counts down, goes negative/red when over)
- Problem description
- Code editor with basic syntax highlighting
- "Test Code" and "Submit Solution" buttons
- Character count display
- "New Team" button to return to entry view

### Mode 2: Leaderboard Display Mode (for monitors/projectors)
- Full-screen leaderboard view
- Auto-refreshes every 30 seconds
- Shows rank, team (category-number), language, character count, time
- No interaction needed - purely for display

## Supabase Schema
```sql
-- Submissions table
CREATE TABLE submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category integer NOT NULL CHECK (category IN (1, 2)),
    team_number integer NOT NULL,
    language text NOT NULL CHECK (language IN ('python', 'javascript')),
    code text NOT NULL,
    character_count integer NOT NULL,
    is_valid boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- No RLS needed for hackathon - keep it simple

-- Settings table for admin configuration
CREATE TABLE settings (
    id integer PRIMARY KEY DEFAULT 1,
    challenge_duration_minutes integer NOT NULL DEFAULT 15
);

-- Insert default settings
INSERT INTO settings (challenge_duration_minutes) VALUES (15);
```

## Supabase Edge Function (Code Execution)
```typescript
// /functions/execute-code/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { code, language } = await req.json()
  
  try {
    let result;
    if (language === 'python') {
      // Execute Python code safely
    } else if (language === 'javascript') {
      // Execute JavaScript code safely  
    }
    
    // Verify output matches expected Fizz Buzz result
    const isValid = validateFizzBuzz(result);
    
    return new Response(JSON.stringify({ 
      success: true, 
      output: result,
      isValid 
    }))
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }))
  }
})
```

## Application Flow & Setup

### Terminal Setup
- **Team terminals**: Navigate to `/` or `/challenge` 
- **Display monitors**: Navigate to `/leaderboard`
- Each terminal operates independently

### Team Flow
1. Team arrives at terminal → **Team Entry View**
2. Select category + enter team number + select language → **Challenge View**  
3. Write code + submit → Success message + option for new team
4. "New Team" button → back to **Team Entry View**

### Timer Behavior
- Starts when team enters challenge view
- Counts down from admin-configured time (default: 15 minutes)
- Turns red and shows negative time when over
- Non-enforcing (teams can still submit)
- Each team gets their own timer

### Admin Configuration
- Update timer duration directly in Supabase dashboard
- Modify `settings.challenge_duration_minutes` value

## Scoring
- **Primary**: Character count (excluding whitespace)
- **Tiebreaker**: Submission timestamp
- **Validation**: Must output exact Fizz Buzz sequence for numbers 1-100

## Development Setup
```bash
npm create vite@latest mini-code-golf -- --template react-ts
cd mini-code-golf
npm install @supabase/supabase-js
npm install -D tailwindcss
supabase init
supabase start
```

## Environment Variables
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Key Features
- No authentication required
- Instant feedback on code execution
- Real-time leaderboard
- Mobile-friendly design
- Minimal setup and maintenance