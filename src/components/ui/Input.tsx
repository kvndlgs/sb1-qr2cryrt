import React from 'react'

interface InputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  type?: string
  error?: string
  className?: string
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  className = ''
}: InputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 bg-gray-800 border rounded-lg
          text-white placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'}
        `}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}