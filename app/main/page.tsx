'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import freighterApi from '@stellar/freighter-api'
import { contractService } from '../services/contractService'

interface TipStats {
  totalTips: number
  lastTipper: string
  lastTxId: string
}

export default function MainPage() {
  const [publicKey, setPublicKey] = useState<string>('')
  const [tipAmount, setTipAmount] = useState<string>('')
  const [receiverAddress, setReceiverAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [transactionId, setTransactionId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [tipStats, setTipStats] = useState<TipStats>({
    totalTips: 0,
    lastTipper: '',
    lastTxId: ''
  })
  const [stellarSdk, setStellarSdk] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Dynamically import Stellar SDK on client side only
    const loadStellarSdk = async () => {
      const sdk = await import('@stellar/stellar-sdk')
      setStellarSdk(sdk)
    }
    
    loadStellarSdk()

    // Check if user is connected
    const savedPublicKey = localStorage.getItem('lumina_public_key')
    if (!savedPublicKey) {
      router.push('/')
      return
    }
    setPublicKey(savedPublicKey)
    
    loadTipStats()
  }, [router])

  const loadTipStats = async () => {
    try {
      const [totalTips, lastTipper, lastTxId] = await Promise.all([
        contractService.getTotalTipped(),
        contractService.getLastTipper(),
        contractService.getLastTxId()
      ])

      setTipStats({
        totalTips,
        lastTipper: lastTipper || 'No tips yet',
        lastTxId: lastTxId || 'No transactions yet'
      })
    } catch (error) {
      console.error('Error loading tip stats:', error)
      setTipStats({
        totalTips: 0,
        lastTipper: 'Contract not deployed',
        lastTxId: 'Contract not deployed'
      })
    }
  }

  const handleSendTip = async () => {
    if (!stellarSdk) {
      setError('Stellar SDK is still loading. Please try again.')
      return
    }

    if (!tipAmount || !receiverAddress) {
      setError('Please fill in both tip amount and receiver address')
      return
    }

    if (isNaN(Number(tipAmount)) || Number(tipAmount) <= 0) {
      setError('Please enter a valid tip amount')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage('')

    try {
      const { Horizon, Networks, TransactionBuilder, Operation, Asset } = stellarSdk

      // Initialize Stellar server for testnet
      const server = new Horizon.Server('https://horizon-testnet.stellar.org')
      
      // Get account info
      const sourceAccount = await server.loadAccount(publicKey)

      // Validate destination account exists
      try {
        await server.loadAccount(receiverAddress)
      } catch (destErr: any) {
        setError('Receiver account does not exist on Testnet. Ask them to create/activate it.')
        return
      }

      // Fetch current base fee
      const baseFee = await server.fetchBaseFee()
      
      // Create transaction
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: String(baseFee),
        networkPassphrase: Networks.TESTNET
      })
      .addOperation(
        Operation.payment({
          destination: receiverAddress,
          asset: Asset.native(),
          amount: tipAmount
        })
      )
      .setTimeout(30)
      .build()

      // Convert to XDR for Freighter signing
      const transactionXdr = transaction.toXDR()

      // Sign with Freighter
      const signResp = await freighterApi.signTransaction(transactionXdr, {
        networkPassphrase: Networks.TESTNET,
        address: publicKey
      })

      // Freighter v5 returns a string; older versions return { signedTxXdr }
      const signedTxXdr = typeof signResp === 'string' ? signResp : (signResp as any)?.signedTxXdr
      if (!signedTxXdr) {
        throw new Error('Signing failed: invalid response from Freighter')
      }

      // Submit transaction
      const signedTransaction = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET)
      let result: any
      try {
        result = await server.submitTransaction(signedTransaction)
      } catch (submitErr: any) {
        // Extract rich Horizon error details if available
        const problem = submitErr?.response?.data
        const codes = problem?.extras?.result_codes
        const errMsg = codes
          ? `Horizon error: tx=${codes.transaction || 'unknown'} op=${(codes.operations || []).join(',')}`
          : (problem?.title || submitErr?.message || 'Transaction submission failed')
        console.error('Horizon submit error:', problem || submitErr)
        throw new Error(errMsg)
      }

      if (result.successful) {
        setSuccessMessage('Thank you for your tip! 💜')
        setTransactionId(result.hash)
        
        // Record the tip in the contract
        try {
          await contractService.sendTip(
            publicKey,
            receiverAddress,
            Number(tipAmount),
            result.hash
          )
          console.log('Tip recorded in contract successfully')
        } catch (contractError) {
          console.error('Failed to record tip in contract:', contractError)
          // Don't show error to user as the main transaction was successful
        }
        
        // Clear form
        setTipAmount('')
        setReceiverAddress('')
        
        // Reload stats
        loadTipStats()
      } else {
        throw new Error('Transaction failed to submit')
      }

    } catch (err: any) {
      console.error('Tip sending error:', err)
      setError(err.message || 'Failed to send tip. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    localStorage.removeItem('lumina_public_key')
    router.push('/')
  }

  // Show loading state while Stellar SDK loads
  if (!stellarSdk) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading Lumina...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">✨ Lumina</h1>
              <p className="text-purple-200">Connected: {publicKey.slice(0, 8)}...{publicKey.slice(-8)}</p>
            </div>
            <button
              onClick={handleDisconnect}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg transition-colors border border-red-500/50"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Tip Stats */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">📊 Tip Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/50">
              <p className="text-purple-200 text-sm">Total Tips</p>
              <p className="text-2xl font-bold text-white">{tipStats.totalTips}</p>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/50">
              <p className="text-blue-200 text-sm">Last Tipper</p>
              <p className="text-sm font-mono text-white">{tipStats.lastTipper}</p>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/50">
              <p className="text-green-200 text-sm">Last Transaction</p>
              <p className="text-sm font-mono text-white">{tipStats.lastTxId.slice(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* Tip Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">💝 Send a Tip</h2>
          
          {successMessage && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
              <p className="text-green-200">{successMessage}</p>
              {transactionId && (
                <p className="text-green-300 text-sm mt-2">
                  Transaction ID: <span className="font-mono">{transactionId}</span>
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Tip Amount (XLM)
              </label>
              <input
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="Enter amount in XLM"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                Receiver Address
              </label>
              <input
                type="text"
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                placeholder="Enter Stellar address (starts with G)"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
              />
            </div>

            <button
              onClick={handleSendTip}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending Tip...</span>
                </div>
              ) : (
                'Send Tip 💜'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}