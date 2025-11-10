export class ContractService {
  constructor(contractId: string, network: 'testnet' | 'mainnet' = 'testnet') {
    console.log('Contract service initialized with ID:', contractId)
  }

  async sendTip(senderAddress: string, receiverAddress: string, amount: number, txId: string): Promise<boolean> {
    console.log('Tip recorded:', { senderAddress, receiverAddress, amount, txId })
    return true
  }

  async getTotalTipped(): Promise<number> { return 0 }
  async getLastTipper(): Promise<string> { return 'No tips yet' }
  async getLastTxId(): Promise<string> { return 'No transactions yet' }
  async getTip(index: number): Promise<any> { return null }
}

// Prefer reading the contract ID from an environment variable for production (Vercel).
// Fallback to the recently deployed Testnet contract ID returned by your deploy command.
const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID || 'CBXUV5TUYUJAMYXYJL4G4RLTWSB6QBFR3QOP6V7HVRNINGYFHVZPZFWB'
export const CONTRACT_ID = contractId
export const contractService = new ContractService(CONTRACT_ID, 'testnet')