import React from 'react'
import { motion } from 'framer-motion'
import { Play, Star, Mic } from 'lucide-react'
import { Character } from '../../lib/supabase'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface CharacterCardProps {
  character: Character
  onSelect?: () => void
  onBattle?: () => void
  selected?: boolean
}

export function CharacterCard({ character, onSelect, onBattle, selected }: CharacterCardProps) {
  const style = typeof character.style === 'string' ? JSON.parse(character.style) : character.style
  
  const getStyleColor = (attitude: string) => {
    switch (attitude) {
      case 'aggressive': return 'text-red-400'
      case 'conscious': return 'text-blue-400'
      case 'humorous': return 'text-yellow-400'
      case 'technical': return 'text-green-400'
      default: return 'text-purple-400'
    }
  }

  return (
    <Card 
      hover
      onClick={onSelect}
      className={`relative overflow-hidden ${selected ? 'ring-2 ring-purple-500' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-white">{character.name}</h3>
              {character.is_default && (
                <Star className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            <p className="text-gray-400 text-sm mb-3">{character.description}</p>
          </div>
          
          {character.avatar_url && (
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={character.avatar_url}
              alt={character.name}
              className="w-16 h-16 rounded-lg object-cover border-2 border-gray-700"
            />
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Style:</span>
            <span className={`font-medium ${getStyleColor(style.attitude)}`}>
              {style.attitude}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tempo:</span>
            <span className="text-white font-medium">{style.tempo}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Complexity:</span>
            <span className="text-white font-medium">{style.complexity}</span>
          </div>
        </div>

        {onBattle && (
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onBattle()
            }}
            className="w-full"
            icon={Mic}
          >
            Battle This Character
          </Button>
        )}
      </div>
    </Card>
  )
}