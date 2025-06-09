import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, User, Mail, Lock, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import toast from 'react-hot-toast'

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendingConfirmation, setResendingConfirmation] = useState(false)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState('')
  
  const { signIn, signUp, resendConfirmation } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setShowEmailConfirmation(false)

    try {
      if (isSignUp) {
        await signUp(email, password, username)
        setShowEmailConfirmation(true)
        setConfirmationEmail(email)
        toast.success('Account created! Please check your email to confirm your account.')
      } else {
        await signIn(email, password)
        toast.success('Welcome back!')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      
      // Handle email confirmation errors more specifically
      if (error.message?.includes('Email not confirmed') || 
          error.message?.includes('email_not_confirmed') ||
          error.code === 'email_not_confirmed') {
        setShowEmailConfirmation(true)
        setConfirmationEmail(email)
        toast.error('Please check your email and click the confirmation link before signing in.')
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please check your credentials and try again.')
      } else if (error.message?.includes('Database error')) {
        toast.error('There was a server error. Please try again in a moment.')
      } else if (error.message?.includes('User already registered')) {
        toast.error('An account with this email already exists. Please sign in instead.')
        setIsSignUp(false)
      } else {
        toast.error(error.message || 'Authentication failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!confirmationEmail) return
    
    setResendingConfirmation(true)
    try {
      await resendConfirmation(confirmationEmail)
      toast.success('Confirmation email sent! Please check your inbox and spam folder.')
    } catch (error: any) {
      console.error('Resend confirmation error:', error)
      if (error.message?.includes('For security purposes')) {
        toast.error('Please wait a moment before requesting another confirmation email.')
      } else {
        toast.error(error.message || 'Failed to resend confirmation email. Please try again.')
      }
    } finally {
      setResendingConfirmation(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 p-8 rounded-2xl border border-gray-700 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Mic className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            RapBattle AI
          </h1>
          <p className="text-gray-400 mt-2">
            {isSignUp ? 'Create your rapper profile' : 'Step into the cypher'}
          </p>
        </div>

        {showEmailConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm flex-1">
                <p className="text-blue-300 font-medium">Email confirmation required</p>
                <p className="text-blue-200 mt-1">
                  We've sent a confirmation link to <strong>{confirmationEmail}</strong>. 
                  Please check your inbox and spam folder, then click the link to verify your account.
                </p>
                <div className="mt-3">
                  <button
                    onClick={handleResendConfirmation}
                    disabled={resendingConfirmation}
                    className="inline-flex items-center space-x-2 text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${resendingConfirmation ? 'animate-spin' : ''}`} />
                    <span>{resendingConfirmation ? 'Sending...' : 'Resend confirmation email'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <Input
              label="Username"
              placeholder="Enter your rapper name"
              value={username}
              onChange={setUsername}
            />
          )}
          
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={setEmail}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={!email || !password || (isSignUp && !username)}
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setShowEmailConfirmation(false)
              setConfirmationEmail('')
            }}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            {isSignUp 
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </motion.div>
    </div>
  )
}