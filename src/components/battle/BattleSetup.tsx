import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sword, ArrowRight } from 'lucide-react'
import { Character } from '../../lib/supabase'
import { useCharacterStore } from '../../store/characterStore'
import { useBattleStore } from '../../store/battleStore'
import { CharacterCard } from '../characters/CharacterCard'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface BattleSetupProps {
  onBattleStart: (char1: Character, char2: Character, topic: string) => void
}

const BATTLE_TOPICS = [
  'Queers For Palestine',
  'Democrats VS. Republicans',
  'Aerodynamic of a Wild Hog',
  'Rap with an Indian Accent',
  'Were Germans Wrong?',
  'Freestyle',
  'Best Mom Jokes',
  'Christian VS. Muslims'
]

export function BattleSetup({ onBattleStart }: BattleSetupProps) {
  const { defaultCharacters, characters, fetchCharacters } = useCharacterStore()
  const { createBattle } = useBattleStore()
  
  const [selectedCharacter1, setSelectedCharacter1] = useState<Character | null>(null)
  const [selectedCharacter2, setSelectedCharacter2] = useState<Character | null>(null)
  const [customTopic, setCustomTopic] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')

  useEffect(() => {
    fetchCharacters()
  }, [fetchCharacters])

  const allCharacters = [...defaultCharacters, ...characters]
  const availableOpponents = allCharacters.filter(char => char.id !== selectedCharacter1?.id)

  const handleStartBattle = async () => {
    if (!selectedCharacter1 || !selectedCharacter2) return
    
    const topic = customTopic || selectedTopic
    if (!topic) return

    await createBattle(selectedCharacter2, selectedCharacter1, topic)
    onBattleStart(selectedCharacter1, selectedCharacter2, topic)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Setup Your Battle
        </h1>
        <p className="text-gray-400">Choose your fighters and topic to begin the cypher</p>
      </motion.div>

      {/* Character Selection */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Step 1: Choose Your Character</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                selected={selectedCharacter1?.id === character.id}
                onSelect={() => setSelectedCharacter1(character)}
              />
            ))}
          </div>
        </div>

        {selectedCharacter1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Step 2: Choose Your Opponent</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableOpponents.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  selected={selectedCharacter2?.id === character.id}
                  onSelect={() => setSelectedCharacter2(character)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {selectedCharacter1 && selectedCharacter2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Step 3: Choose Battle Topic</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BATTLE_TOPICS.map((topic) => (
                  <Button
                    key={topic}
                    onClick={() => {
                      setSelectedTopic(topic)
                      setCustomTopic('')
                    }}
                    variant={selectedTopic === topic ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    {topic}
                  </Button>
                ))}
              </div>
              
              <div className="max-w-md">
                <Input
                  label="Or enter custom topic"
                  placeholder="Enter your own battle topic..."
                  value={customTopic}
                  onChange={(value) => {
                    setCustomTopic(value)
                    setSelectedTopic('')
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Battle Preview */}
      {selectedCharacter1 && selectedCharacter2 && (customTopic || selectedTopic) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 text-center">Battle Preview</h3>
          
          <div className="flex items-center justify-center space-x-8 mb-6">
            <div className="text-center">
              <img
                src={selectedCharacter1.avatar_url}
                alt={selectedCharacter1.name}
                className="w-20 h-20 rounded-lg object-cover mx-auto mb-2"
              />
              <p className="text-white font-medium">{selectedCharacter1.name}</p>
            </div>
            
            <div className="flex items-center">
              <Sword className="w-8 h-8 text-red-400" />
            </div>
            
            <div className="text-center">
              <img
                src={selectedCharacter2.avatar_url}
                alt={selectedCharacter2.name}
                className="w-20 h-20 rounded-lg object-cover mx-auto mb-2"
              />
              <p className="text-white font-medium">{selectedCharacter2.name}</p>
            </div>
          </div>
          
          <p className="text-center text-gray-400 mb-6">
            Topic: <span className="text-purple-400 font-medium">{customTopic || selectedTopic}</span>
          </p>
          
          <div className="flex justify-center">
            <Button
              onClick={handleStartBattle}
              size="lg"
              icon={ArrowRight}
              className="text-lg px-8"
            >
              Start Battle!
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}