import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useCharacterStore } from './store/characterStore'
import { AuthForm } from './components/auth/AuthForm'
import { Navbar } from './components/layout/Navbar'
import { BattleSetup } from './components/battle/BattleSetup'
import { BattleArena } from './components/battle/BattleArena'
import { CharacterCard } from './components/characters/CharacterCard'
import { Character } from './lib/supabase'
import { motion } from 'framer-motion'

function App() {
  const { user, loading } = useAuthStore()
  const { defaultCharacters, characters, fetchCharacters, initializeDefaultCharacters } = useCharacterStore()
  
  const [currentView, setCurrentView] = useState('battle')
  const [battleState, setBattleState] = useState<'setup' | 'active'>('setup')
  const [battleCharacters, setBattleCharacters] = useState<{
    char1: Character | null
    char2: Character | null
    topic: string
  }>({ char1: null, char2: null, topic: '' })

  useEffect(() => {
    if (user) {
      initializeDefaultCharacters()
      fetchCharacters()
    }
  }, [user, initializeDefaultCharacters, fetchCharacters])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <AuthForm />
        <Toaster position="top-right" />
      </>
    )
  }

  const handleBattleStart = (char1: Character, char2: Character, topic: string) => {
    setBattleCharacters({ char1, char2, topic })
    setBattleState('active')
  }

  const handleBattleEnd = () => {
    setBattleState('setup')
    setBattleCharacters({ char1: null, char2: null, topic: '' })
  }

  const renderContent = () => {
    switch (currentView) {
      case 'battle':
        if (battleState === 'active' && battleCharacters.char1 && battleCharacters.char2) {
          return (
            <BattleArena
              character1={battleCharacters.char1}
              character2={battleCharacters.char2}
              topic={battleCharacters.topic}
            />
          )
        }
        return <BattleSetup onBattleStart={handleBattleStart} />

      case 'characters':
        return (
          <div className="max-w-6xl mx-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Character Gallery
              </h1>
              <p className="text-gray-400">Choose your rapper persona</p>
            </motion.div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Default Characters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {defaultCharacters.map((character) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      onBattle={() => {
                        setBattleCharacters({ char1: character, char2: null, topic: '' })
                        setCurrentView('battle')
                      }}
                    />
                  ))}
                </div>
              </div>

              {characters.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Your Characters</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {characters.map((character) => (
                      <CharacterCard
                        key={character.id}
                        character={character}
                        onBattle={() => {
                          setBattleCharacters({ char1: character, char2: null, topic: '' })
                          setCurrentView('battle')
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'leaderboard':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Leaderboard
              </h1>
              <p className="text-gray-400">Top rappers in the cypher</p>
            </motion.div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
              <p className="text-center text-gray-400">
                Leaderboard coming soon! Start battling to see your stats here.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="pt-6">
        {renderContent()}
      </main>
      
      <Toaster position="top-right" />
    </div>
  )
}

export default App