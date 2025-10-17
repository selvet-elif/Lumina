'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import freighterApi from '@stellar/freighter-api'

export default function ConnectPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if Freighter is installed and if user is already connected
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const { isConnected: freighterConnected } = await freighterApi.isConnected()
      if (freighterConnected) {
        const { isAllowed } = await freighterApi.isAllowed()
        if (isAllowed) {
          setIsConnected(true)
          // Check if we have a saved public key
          const savedPublicKey = localStorage.getItem('lumina_public_key')
          if (savedPublicKey) {
            // Auto-redirect to main page if already connected
            router.push('/main')
          }
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err)
    }
  }

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if Freighter is installed
      const { isConnected: freighterConnected } = await freighterApi.isConnected()
      if (!freighterConnected) {
        setError('Freighter wallet is not installed. Please install it from https://freighter.app/')
        setIsLoading(false)
        return
      }

      // Request access to the wallet
      const { address, error: accessError } = await freighterApi.requestAccess()
      
      if (accessError) {
        setError(`Failed to connect: ${accessError}`)
        setIsLoading(false)
        return
      }

      if (address) {
        // Save public key to localStorage
        localStorage.setItem('lumina_public_key', address)
        setIsConnected(true)
        
        // Redirect to main page
        router.push('/main')
      }
    } catch (err) {
      console.error('Connection error:', err)
      setError('Failed to connect to Freighter wallet. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">✨ Lumina</h1>
          <p className="text-purple-200">Send tips with Stellar XLM</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {isConnected ? (
            <div className="space-y-4">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-200">✅ Connected to Freighter!</p>
              </div>
              <button
                onClick={() => router.push('/main')}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Go to Tipping App
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                'Connect Freighter Wallet'
              )}
            </button>
          )}

          <div className="text-purple-300 text-sm">
            <p>Don't have Freighter? <a href="https://freighter.app/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Install it here</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}

