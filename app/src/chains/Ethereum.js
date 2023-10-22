import axios from "axios"
import Chain from "./Chain"

export default class Ethereum extends Chain {
    constructor() {
        super()
        this.chain = "ethereum"
        this.decimals = 18
        this.apiKey = "P58PHJJUQCEMCX56HAKSMTVF3G78RAC7BA"
        this.apiUrl = "https://api.etherscan.io/api?" +
            "module=account&" +
            "action=balance&" +
            "tag=latest&" +
            `apikey=${this.apiKey}&` +
            "address="
    }
  
    async getWallet(address) {
      const free = await this.getFreeBalance(address)
      let assets = []

      const amount = this.calcDecimals(parseFloat(free.result), this.decimals)

      assets.push({
        ...this.getEthAssetObj(),
        name: "ETH",
        freeBalance: amount,
        totalBalance: amount
      })
      
      return {chain: this.chain, address: address, assets: assets}
    }

    getEthAssetObj() {
        return {
            ...this.genAssetObj(),
            chain: this.chain,
        }
    }
    
    getFreeBalance(address) {
      return new Promise((resolve, reject) => {
        axios.get(this.apiUrl + address).then((response) => {
          const data = response.data
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    }
}