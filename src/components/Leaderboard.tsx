import { useState, useEffect } from 'react'
import { supabase, type Submission } from '../lib/supabase'

function Leaderboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('is_valid', true)
      .order('character_count', { ascending: true })
      .order('solve_time_seconds', { ascending: true })
      .order('created_at', { ascending: true })

    if (data) {
      setSubmissions(data)
    }
  }

  const formatSolveTime = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const submissionTime = new Date(timestamp)
    const diffMs = now.getTime() - submissionTime.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  useEffect(() => {
    fetchSubmissions()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSubmissions, 30000)
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('submissions')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'submissions' 
      }, () => {
        fetchSubmissions()
      })
      .subscribe()

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [])

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-xl'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-black font-bold text-lg'
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold text-lg'
      default:
        return 'bg-gray-800 text-white hover:bg-gray-700'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return rank
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            🏆 CODE GOLF LEADERBOARD 🏆
          </h1>
          <p className="text-2xl text-gray-300">JavaScript Fizz Buzz Challenge</p>
          <p className="text-lg text-gray-400 mt-2">Shortest code wins!</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-8 py-6 text-left text-2xl font-bold">Rank</th>
                <th className="px-8 py-6 text-left text-2xl font-bold">Team</th>
                <th className="px-8 py-6 text-right text-2xl font-bold">Characters</th>
                <th className="px-8 py-6 text-right text-2xl font-bold">Solve Time</th>
                <th className="px-8 py-6 text-right text-2xl font-bold">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => {
                const rank = index + 1
                return (
                  <tr 
                    key={submission.id} 
                    className={`border-t border-gray-600 transition-all duration-300 ${getRankStyle(rank)}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-mono font-bold">
                          {getRankIcon(rank)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-3xl font-bold ${rank <= 3 ? 'text-shadow' : ''}`}>
                        cat-{submission.category}-team-{submission.team_number}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`text-3xl font-mono font-bold ${
                        rank <= 3 ? 'text-gray-800' : 'text-green-400'
                      }`}>
                        {submission.character_count}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`text-2xl font-mono font-bold ${
                        rank <= 3 ? 'text-gray-800' : 'text-yellow-400'
                      }`}>
                        {formatSolveTime(submission.solve_time_seconds)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-lg text-gray-300">
                        {formatRelativeTime(submission.created_at)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {submissions.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-4">🚀</div>
              <div className="text-2xl font-bold">No submissions yet!</div>
              <div className="text-xl mt-2">Be the first to solve the challenge!</div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur rounded-full px-6 py-3 border border-gray-600">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-lg text-gray-300">Auto-refreshes every 30 seconds</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard