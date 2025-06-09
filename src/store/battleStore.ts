import { create } from 'zustand'
import { supabase, type Battle, type Character } from '../lib/supabase'
import { generateRapVerse, scoreVerse, RapStyle } from '../lib/groq'
import { synthesizeVoice } from '../lib/elevenlabs'

interface BattleVerse {
  character_id: string
  verse: string
  score: number
  audio_url?: string
}

interface BattleState {
  currentBattle: Battle | null
  verses: BattleVerse[]
  battleHistory: Battle[]
  loading: boolean
  generating: boolean
  playingAudio: boolean
  createBattle: (opponent: Character, character: Character, topic: string) => Promise<void>
  generateVerse: (character: Character, isResponse?: boolean) => Promise<void>
  playVerse: (verse: BattleVerse, character: Character) => Promise<void>
  endBattle: () => Promise<void>
  fetchBattleHistory: () => Promise<void>
}

export const useBattleStore = create<BattleState>((set, get) => ({
  currentBattle: null,
  verses: [],
  battleHistory: [],
  loading: false,
  generating: false,
  playingAudio: false,

  createBattle: async (opponent: Character, character: Character, topic: string) => {
    set({ loading: true })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Must be logged in')
      
      const { data, error } = await supabase
        .from('battles')
        .insert({
          user1_id: user.id,
          user2_id: opponent.user_id || user.id,
          character1_id: character.id,
          character2_id: opponent.id,
          topic,
          verses: [],
          status: 'active'
        })
        .select()
        .single()
      
      if (error) throw error
      
      set({ 
        currentBattle: data,
        verses: [],
        loading: false
      })
    } catch (error) {
      console.error('Error creating battle:', error)
      set({ loading: false })
    }
  },

  generateVerse: async (character: Character, isResponse = false) => {
    const { currentBattle, verses } = get()
    if (!currentBattle) return
    
    set({ generating: true })
    
    try {
      const style = typeof character.style === 'string' ? JSON.parse(character.style) : character.style as RapStyle
      const previousVerse = isResponse && verses.length > 0 ? verses[verses.length - 1].verse : undefined
      
      const voiceSettings = typeof character.voice_settings === 'string' ? JSON.parse(character.voice_settings || '{}') : character.voice_settings || {}
      
      const verse = await generateRapVerse({
        character: {
          name: character.name,
          style,
          personality: character.description,
          signature: voiceSettings.signature || []
        },
        topic: currentBattle.topic,
        opponent: isResponse ? 'previous rapper' : undefined,
        previousVerse,
        battleContext: `Battle ${verses.length + 1} of rap battle`
      })
      
      const score = await scoreVerse(verse, [
        'rhyme scheme complexity',
        'wordplay creativity',
        'flow and rhythm',
        'battle relevance'
      ])
      
      const newVerse: BattleVerse = {
        character_id: character.id,
        verse,
        score
      }
      
      set(state => ({
        verses: [...state.verses, newVerse],
        generating: false
      }))
      
      // Update battle in database
      const updatedVerses = [...verses, newVerse]
      await supabase
        .from('battles')
        .update({ verses: updatedVerses })
        .eq('id', currentBattle.id)
        
    } catch (error) {
      console.error('Error generating verse:', error)
      set({ generating: false })
    }
  },

  playVerse: async (verse: BattleVerse, character: Character) => {
    set({ playingAudio: true })
    
    try {
      const voiceSettings = typeof character.voice_settings === 'string' ? JSON.parse(character.voice_settings || '{}') : character.voice_settings || {}
      const audioBlob = await synthesizeVoice(
        verse.verse,
        voiceSettings.voice_id,
        voiceSettings.settings
      )
      
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        set({ playingAudio: false })
        URL.revokeObjectURL(audioUrl)
      }
      
      await audio.play()
    } catch (error) {
      console.error('Error playing verse:', error)
      set({ playingAudio: false })
    }
  },

  endBattle: async () => {
    const { currentBattle, verses } = get()
    if (!currentBattle) return
    
    // Determine winner based on average scores
    const character1Verses = verses.filter(v => v.character_id === currentBattle.character1_id)
    const character2Verses = verses.filter(v => v.character_id === currentBattle.character2_id)
    
    const char1AvgScore = character1Verses.reduce((sum, v) => sum + v.score, 0) / character1Verses.length
    const char2AvgScore = character2Verses.reduce((sum, v) => sum + v.score, 0) / character2Verses.length
    
    const winnerId = char1AvgScore > char2AvgScore ? currentBattle.user1_id : currentBattle.user2_id
    
    await supabase
      .from('battles')
      .update({ 
        status: 'completed',
        winner_id: winnerId,
        verses
      })
      .eq('id', currentBattle.id)
    
    set({ 
      currentBattle: null,
      verses: []
    })
  },

  fetchBattleHistory: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      
      set({ battleHistory: data })
    } catch (error) {
      console.error('Error fetching battle history:', error)
    }
  }
}))