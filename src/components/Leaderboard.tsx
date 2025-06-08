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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Code Golf Leaderboard</h1>
        
        <div className="text-center mb-6 text-gray-400">
          JavaScript Code Golf Challenge
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Team</th>
                <th className="px-6 py-3 text-left">Language</th>
                <th className="px-6 py-3 text-right">Characters</th>
                <th className="px-6 py-3 text-right">Solve Time</th>
                <th className="px-6 py-3 text-right">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => (
                <tr key={submission.id} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="px-6 py-4 font-mono">{index + 1}</td>
                  <td className="px-6 py-4">
                    {submission.category}-{submission.team_number}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-sm bg-yellow-600">
                      JAVASCRIPT
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono">
                    {submission.character_count}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-green-400">
                    {formatSolveTime(submission.solve_time_seconds)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-400">
                    {formatRelativeTime(submission.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {submissions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No submissions yet. Be the first to solve the challenge!
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-400">
          Auto-refreshes every 30 seconds
        </div>
      </div>
    </div>
  )
}

export default Leaderboard