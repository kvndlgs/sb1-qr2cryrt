import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, Trophy, Zap } from 'lucide-react'
import { Character } from '../../lib/supabase'
import { useBattleStore } from '../../store/battleStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface BattleArenaProps {
  character1: Character
  character2: Character
  topic: string
}

export function BattleArena({ character1, character2, topic }: BattleArenaProps) {
  const { 
    verses, 
    generating, 
    playingAudio,
    generateVerse, 
    playVerse, 
    endBattle 
  } = useBattleStore()
  
  const [currentRound, setCurrentRound] = useState(1)
  const maxRounds = 3

  const character1Verses = verses.filter(v => v.character_id === character1.id)
  const character2Verses = verses.filter(v => v.character_id === character2.id)

  const handleGenerateVerse = async (character: Character) => {
    const isResponse = verses.length > 0 && verses.length % 2 === 1
    await generateVerse(character, isResponse)
    
    if (verses.length >= maxRounds * 2 - 1) {
      // Battle complete
      setTimeout(() => endBattle(), 2000)
    }
  }

  const getAverageScore = (characterVerses: any[]) => {
    if (characterVerses.length === 0) return 0
    return characterVerses.reduce((sum, v) => sum + v.score, 0) / characterVerses.length
  }

  const char1Score = getAverageScore(character1Verses)
  const char2Score = getAverageScore(character2Verses)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Battle Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          BATTLE ARENA
        </h1>
        <p className="text-gray-400">Topic: {topic}</p>
        <p className="text-sm text-gray-500">Round {Math.ceil(verses.length / 2 + 1)} of {maxRounds}</p>
      </motion.div>

      {/* Contestants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[character1, character2].map((character, index) => {
          const isLeft = index === 0
          const characterVerses = isLeft ? character1Verses : character2Verses
          const averageScore = getAverageScore(characterVerses)
          
          return (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              className={`relative ${isLeft ? 'md:text-left' : 'md:text-right'}`}
            >
              <Card className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  isLeft ? 'from-blue-600/10 to-purple-600/10' : 'from-red-600/10 to-pink-600/10'
                }`} />
                
                <div className="relative">
                  <div className={`flex items-center gap-4 ${isLeft ? '' : 'flex-row-reverse'}`}>
                    {character.avatar_url && (
                      <img
                        src={character.avatar_url}
                        alt={character.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-700"
                      />
                    )}
                    <div className={isLeft ? '' : 'text-right'}>
                      <h3 className="text-xl font-bold text-white">{character.name}</h3>
                      <p className="text-gray-400 text-sm">{character.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-medium">
                        Score: {averageScore.toFixed(1)}
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => handleGenerateVerse(character)}
                      disabled={generating || verses.length >= maxRounds * 2}
                      loading={generating}
                      size="sm"
                      icon={Zap}
                    >
                      Drop Bars
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Verses Display */}
      <div className="space-y-4">
        <AnimatePresence>
          {verses.map((verse, index) => {
            const character = verse.character_id === character1.id ? character1 : character2
            const isLeft = verse.character_id === character1.id
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLeft ? -50 : 50 }}
                className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}
              >
                <Card className={`max-w-2xl ${isLeft ? 'mr-8' : 'ml-8'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex items-center gap-2 ${isLeft ? '' : 'flex-row-reverse'}`}>
                      <h4 className="text-lg font-semibold text-white">{character.name}</h4>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">{verse.score}/10</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => playVerse(verse, character)}
                      disabled={playingAudio}
                      variant="ghost"
                      size="sm"
                      icon={playingAudio ? Pause : Play}
                    >
                      {playingAudio ? 'Playing...' : 'Play'}
                    </Button>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {verse.verse}
                    </pre>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Battle Controls */}
      {verses.length >= maxRounds * 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Battle Complete!</h3>
            <div className="space-y-2 mb-4">
              <div className={`text-lg ${char1Score > char2Score ? 'text-green-400' : 'text-gray-400'}`}>
                {character1.name}: {char1Score.toFixed(1)}
              </div>
              <div className={`text-lg ${char2Score > char1Score ? 'text-green-400' : 'text-gray-400'}`}>
                {character2.name}: {char2Score.toFixed(1)}
              </div>
            </div>
            <p className="text-xl font-bold text-white">
              Winner: {char1Score > char2Score ? character1.name : character2.name}!
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  )
}