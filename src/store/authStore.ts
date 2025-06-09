import { create } from 'zustand'
import { supabase, type Profile } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  fetchProfile: () => Promise<void>
  resendConfirmation: (email: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        // Handle specific email confirmation error
        if (error.message?.includes('Email not confirmed') || 
            error.message?.includes('email_not_confirmed') ||
            error.code === 'email_not_confirmed') {
          const confirmationError = new Error('Email not confirmed')
          confirmationError.name = 'EmailNotConfirmedError'
          throw confirmationError
        }
        throw error
      }
      
      if (data.user) {
        set({ user: data.user })
        await get().fetchProfile()
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw error
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      })
      
      if (error) {
        console.error('Sign up error:', error)
        throw error
      }
      
      if (data.user) {
        set({ user: data.user })
        
        // Only fetch profile if user is confirmed
        if (data.user.email_confirmed_at) {
          await get().fetchProfile()
        }
      }
    } catch (error: any) {
      console.error('Sign up process error:', error)
      throw error
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, profile: null })
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get()
    if (!user) throw new Error('No user logged in')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) throw error
      set({ profile: data })
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  },

  fetchProfile: async () => {
    const { user } = get()
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        // If profile doesn't exist and user is confirmed, create it
        if (error.code === 'PGRST116' && user.email_confirmed_at) {
          const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User'
          
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                username,
                wins: 0,
                losses: 0,
                total_battles: 0
              })
              .select()
              .single()
            
            if (createError) {
              console.error('Failed to create profile:', createError)
              return
            }
            
            set({ profile: newProfile })
            return
          } catch (createError) {
            console.error('Profile creation failed:', createError)
            return
          }
        }
        
        console.error('Failed to fetch profile:', error)
        return
      }
      
      set({ profile: data })
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  },

  resendConfirmation: async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })
      
      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error('Resend confirmation error:', error)
      throw error
    }
  }
}))

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({ 
    user: session?.user ?? null, 
    loading: false 
  })
  
  if (session?.user && session.user.email_confirmed_at) {
    useAuthStore.getState().fetchProfile()
  }
})

supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.setState({ 
    user: session?.user ?? null,
    loading: false
  })
  
  if (session?.user && session.user.email_confirmed_at) {
    useAuthStore.getState().fetchProfile()
  } else {
    useAuthStore.setState({ profile: null })
  }
})