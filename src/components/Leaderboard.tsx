import { useState, useEffect } from 'react'
import { supabase, type Submission } from '../lib/supabase'

function Leaderboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filter, setFilter] = useState<'all' | 'python' | 'javascript'>('all')

  const fetchSubmissions = async () => {
    let query = supabase
      .from('submissions')
      .select('*')
      .eq('is_valid', true)
      .order('character_count', { ascending: true })
      .order('created_at', { ascending: true })

    if (filter !== 'all') {
      query = query.eq('language', filter)
    }

    const { data } = await query
    if (data) {
      setSubmissions(data)
    }
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
  }, [filter])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Code Golf Leaderboard</h1>
        
        <div className="flex justify-center mb-6">
          <div className="bg-gray-800 rounded-lg p-1 flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${
                filter === 'all' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              All Languages
            </button>
            <button
              onClick={() => setFilter('python')}
              className={`px-4 py-2 rounded ${
                filter === 'python' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setFilter('javascript')}
              className={`px-4 py-2 rounded ${
                filter === 'javascript' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              JavaScript
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Team</th>
                <th className="px-6 py-3 text-left">Language</th>
                <th className="px-6 py-3 text-right">Characters</th>
                <th className="px-6 py-3 text-right">Time</th>
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
                    <span className={`px-2 py-1 rounded text-sm ${
                      submission.language === 'python' 
                        ? 'bg-blue-600' 
                        : 'bg-yellow-600'
                    }`}>
                      {submission.language.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono">
                    {submission.character_count}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-400">
                    {new Date(submission.created_at).toLocaleTimeString()}
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