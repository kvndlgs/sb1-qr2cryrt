import React from 'react'
import { motion } from 'framer-motion'
import { Mic, User, LogOut, Trophy, Users } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'

interface NavbarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { user, profile, signOut } = useAuthStore()

  const navItems = [
    { id: 'battle', label: 'Battle', icon: Mic },
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
  ]

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gray-900 border-b border-gray-700 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <motion.h1 
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            RapBattle AI
          </motion.h1>
          
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                variant={currentView === item.id ? 'primary' : 'ghost'}
                icon={item.icon}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white font-medium">{profile?.username}</p>
              <p className="text-gray-400 text-sm">
                {profile?.wins}W - {profile?.losses}L
              </p>
            </div>
            <Button
              onClick={signOut}
              variant="ghost"
              icon={LogOut}
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </motion.nav>
  )
}