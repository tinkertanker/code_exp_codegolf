import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface TimerProps {
  startTime: number
}

function Timer({ startTime }: TimerProps) {
  const [duration, setDuration] = useState(15) // Default 15 minutes
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    // Fetch challenge duration from settings
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('challenge_duration_minutes')
        .single()
      
      if (data) {
        setDuration(data.challenge_duration_minutes)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = (duration * 60 * 1000) - elapsed
      setTimeLeft(Math.floor(remaining / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, duration])

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds)
    const mins = Math.floor(absSeconds / 60)
    const secs = absSeconds % 60
    const sign = seconds < 0 ? '-' : ''
    return `${sign}${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isOvertime = timeLeft < 0

  return (
    <div className={`text-2xl font-mono ${isOvertime ? 'text-red-600' : 'text-gray-800'}`}>
      Time: {formatTime(timeLeft)}
    </div>
  )
}

export default Timer