import { create } from 'zustand'
import { supabase, type Character } from '../lib/supabase'

interface CharacterState {
  characters: Character[]
  defaultCharacters: Character[]
  selectedCharacter: Character | null
  loading: boolean
  fetchCharacters: () => Promise<void>
  createCharacter: (character: Omit<Character, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  selectCharacter: (character: Character) => void
  initializeDefaultCharacters: () => Promise<void>
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  defaultCharacters: [],
  selectedCharacter: null,
  loading: false,

  fetchCharacters: async () => {
    set({ loading: true })
    
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const defaultChars = data.filter(char => char.is_default)
      const userChars = data.filter(char => !char.is_default)
      
      set({ 
        characters: userChars,
        defaultCharacters: defaultChars,
        loading: false
      })
    } catch (error) {
      console.error('Error fetching characters:', error)
      set({ loading: false })
    }
  },

  createCharacter: async (character) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Must be logged in to create characters')
    
    const { data, error } = await supabase
      .from('characters')
      .insert({
        ...character,
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    set(state => ({
      characters: [data, ...state.characters]
    }))
  },

  selectCharacter: (character) => {
    set({ selectedCharacter: character })
  },

  initializeDefaultCharacters: async () => {
    try {
      // Simply fetch existing default characters
      // Default characters should be pre-seeded in the database via migrations or admin panel
      await get().fetchCharacters()
    } catch (error) {
      console.error('Error fetching default characters:', error)
    }
  }
}))