import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Submission = {
  id: string
  category: 1 | 2
  team_number: number
  language: 'javascript'
  code: string
  character_count: number
  is_valid: boolean
  solve_time_seconds: number | null
  created_at: string
}

export type Settings = {
  id: number
  challenge_duration_minutes: number
}