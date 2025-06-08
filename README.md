# Mini Code Golf

A lightweight web application for running team-based code golf competitions during hackathons. Teams solve the classic Fizz Buzz problem in the fewest characters possible using JavaScript.

## Features

- **Two Modes**: Team challenge mode for participants and leaderboard display mode for monitors
- **Language Support**: JavaScript
- **Live Timer**: Configurable countdown timer (non-enforcing)
- **Real-time Leaderboard**: Auto-refreshing rankings with language filtering
- **Character Counting**: Automatic character counting (excluding whitespace)
- **Code Testing**: Test code before submission with instant feedback

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Netlify account for deployment (optional)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/tinkertanker/code_exp_codegolf.git
   cd code_exp_codegolf
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create Supabase Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your **Project URL** and **Anon Key** from Settings → API

4. **Set up database schema**
   Go to **SQL Editor** in Supabase dashboard and run:
   ```sql
   -- Submissions table
   CREATE TABLE submissions (
       id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
       category integer NOT NULL CHECK (category IN (1, 2)),
       team_number integer NOT NULL,
       language text NOT NULL CHECK (language IN ('javascript')),
       code text NOT NULL,
       character_count integer NOT NULL,
       is_valid boolean NOT NULL DEFAULT false,
       solve_time_seconds integer,
       created_at timestamp with time zone DEFAULT now()
   );

   -- Settings table for admin configuration
   CREATE TABLE settings (
       id integer PRIMARY KEY DEFAULT 1,
       challenge_duration_minutes integer NOT NULL DEFAULT 15
   );

   -- Insert default settings
   INSERT INTO settings (challenge_duration_minutes) VALUES (15);

   -- Disable RLS for hackathon simplicity
   ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
   ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
   ```

5. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

6. **Install Supabase CLI and deploy Edge Function**
   ```bash
   # Install CLI
   brew install supabase/tap/supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project (get project-ref from Settings → General → Reference ID)
   supabase link --project-ref your-project-ref
   
   # Make sure Docker is running, then deploy the function
   supabase functions deploy execute-code
   ```

7. **Run locally**
   ```bash
   npm run dev
   ```
   
   Your app will be available at:
   - **Team terminals**: `http://localhost:5173/`
   - **Leaderboard display**: `http://localhost:5173/leaderboard`

## Usage

### For Organizers

1. **Set up terminals**: 
   - Team terminals: Navigate to `http://localhost:5173/`
   - Display monitors: Navigate to `http://localhost:5173/leaderboard`

2. **Configure timer** (optional):
   - Update `challenge_duration_minutes` in Supabase dashboard
   - Default is 15 minutes

### For Participants

1. Enter team category (1 or 2) and team number
2. Code will be executed in JavaScript
3. Write your Fizz Buzz solution
4. Test your code to verify correctness
5. Submit when ready

## The Challenge

Write a program that prints numbers from 1 to 100, but:
- For multiples of 3, print "Fizz"
- For multiples of 5, print "Buzz"
- For multiples of both 3 and 5, print "FizzBuzz"

## Deployment

### Netlify

1. Push code to GitHub
2. Connect repository in Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Supabase Edge Function

The code execution function is deployed via the CLI setup above.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Code Editor**: Monaco Editor
- **Routing**: React Router

## Troubleshooting

### Common Issues

1. **"Failed to test code" error**
   - Make sure the Edge Function is deployed: `supabase functions deploy execute-code`
   - Check that Docker is running before deployment

2. **Environment variables not working**
   - Make sure `.env` file exists with correct Supabase credentials
   - Restart dev server after changing `.env`

3. **Database connection issues**
   - Verify your Supabase URL and Anon Key are correct
   - Check that RLS is disabled on both tables

4. **Tailwind CSS errors**
   - We use Tailwind CSS v3 for compatibility
   - Restart dev server if styles aren't loading

### Leaderboard Features

- **Solve Time**: Shows how long teams took to solve (format: `3:45`)
- **Submitted**: Shows relative time (`2m ago`, `1h ago`)
- **Auto-refresh**: Updates every 30 seconds
- **Real-time**: New submissions appear immediately

## Contributing

Feel free to submit issues and pull requests!

## License

MIT