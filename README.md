# Mini Code Golf

A lightweight web application for running team-based code golf competitions during hackathons. Teams solve the classic Fizz Buzz problem in the fewest characters possible using Python or JavaScript.

## Features

- **Two Modes**: Team challenge mode for participants and leaderboard display mode for monitors
- **Language Support**: Python and JavaScript
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
   - Go to SQL Editor and run the schema from `CLAUDE.md`

4. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Run locally**
   ```bash
   npm run dev
   ```

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
2. Select programming language (Python/JavaScript)
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

The code execution function needs to be deployed separately. See `CLAUDE.md` for detailed instructions.

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

## Contributing

Feel free to submit issues and pull requests!

## License

MIT