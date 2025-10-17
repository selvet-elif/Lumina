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

export const CONTRACT_ID = 'CA4CQNWUZS2KMCT4QSCQQ24PED4NOZU2FFCE5F36NOJNUK5SENPQPXZA'
export const contractService = new ContractService(CONTRACT_ID, 'testnet')