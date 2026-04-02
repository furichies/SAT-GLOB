'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'warning'
  duration?: number
  onClose?: () => void
}

export function Notification({ message, type, duration = 5000, onClose }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) {
        onClose()
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'error':
        return <AlertCircle className="h-5 w-5" />
      case 'warning':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <CheckCircle className="h-5 w-5" />
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg ${getStyles()} transition-all duration-300`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`mt-0.5 ml-2 ${type === 'success' ? 'text-green-600 hover:text-green-800' : type === 'error' ? 'text-red-600 hover:text-red-800' : 'text-yellow-600 hover:text-yellow-800'}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
