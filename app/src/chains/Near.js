import axios from "axios"
import Chain from "./Chain"


export default class Near extends Chain{
    constructor() {
        super()
        this.chain = "near"
        this.decimals = 24
        this.queryId = 1

        this.apiUrl = "https://rpc.mainnet.near.org/"
        this.stakeApi = "https://api.kitwallet.app/staking-deposits/"
    }

    async getWallet(address) {
      const balance = await this.getFreeBalance(address)
      const stakes = await this.getStake(address)
      let assets = []

      const freeAmount = this.calcDecimals(balance.amount, this.decimals)
      let amountInStake = 0
      stakes.forEach(stake =>{
        amountInStake += this.calcDecimals(stake.deposit, this.decimals)
      })
      assets.push({
        ...this.getNearAssetObj(),
        freeBalance: freeAmount,
        lockedBalance: amountInStake,
        totalBalance: freeAmount + amountInStake
      })
      
      console.log(stakes)

      return {chain: this.chain, address: address, assets: assets}
    }

    getNearAssetObj() {
        return {
            ...this.genAssetObj(),
            name: "NEAR",
            chain: this.chain,
        }
    }

    async getFreeBalance(address) {
      let params = {
        "method": "query",
        "params": {
          "request_type": "view_account",
          "account_id": address,
          "finality": "optimistic"
        },
        "id": this.queryId,
        "jsonrpc":"2.0"
      }
      this.queryId++

      return new Promise((resolve, reject) => {
        axios.post(this.apiUrl, params).then((response) => {
          const data = response.data.result
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    }

    async getStake(address) {
      return new Promise((resolve, reject) => {
        axios.get(`${this.stakeApi}${address}`).then((response) => {
          const data = response.data
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }