import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Profile = {
  id: string
  username: string
  avatar_url?: string
  wins: number
  losses: number
  total_battles: number
  created_at: string
}

export type Character = {
  id: string
  user_id: string | null
  name: string
  description: string
  style: string
  personality: string
  signature: string[]
  voice_settings: any
  avatar_url?: string
  is_default: boolean
  created_at: string
}

export type Battle = {
  id: string
  user1_id: string
  user2_id: string
  character1_id: string
  character2_id: string
  topic: string
  verses: any[]
  winner_id?: string
  status: 'pending' | 'active' | 'completed'
  created_at: string
}