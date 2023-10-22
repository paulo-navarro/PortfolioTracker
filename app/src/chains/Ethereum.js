import axios from "axios"
import Chain from "./Chain"

const ERC20 = {
  tokens: {
    AAVE: {
      contract: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      symbol: "",
      symbol: "AAVE",
      priceName: "aave",
      decimals: 18
    }
  }
}

export default class Ethereum extends Chain {
    constructor() {
        super()
        this.chain = "ethereum"
        this.decimals = 18
        this.apiKey = "P58PHJJUQCEMCX56HAKSMTVF3G78RAC7BA"
        this.apiBaseUrl = "https://api.etherscan.io/api?"

        this.apiUrl = this.apiBaseUrl +
            "module=account&" +
            "action=balance&" +
            "tag=latest&" +
            `apikey=${this.apiKey}&` +
            "address="
        this.AAVEcontract = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9"
    }
  
    async getWallet(address) {
      const free = await this.getFreeBalance(address)
      const aave = await this.getERC20(ERC20.tokens.AAVE.contract, address)
 
      let assets = []

      const amount = this.calcDecimals(parseFloat(free.result), this.decimals)


      assets.push({
        ...this.getEthAssetObj(),
        symbol: "ETH",
        freeBalance: amount,
        totalBalance: amount
      })


      if(aave?.status === "1" && aave.result !== "0") {
        const aaveAmount = this.calcDecimals(parseFloat(aave.result), ERC20.tokens.AAVE.decimals)
        assets.push({
          ...this.getEthAssetObj(),
          symbol: ERC20.tokens.AAVE.symbol,
          priceName: ERC20.tokens.AAVE.priceName,
          freeBalance: aaveAmount,
          totalBalance: aaveAmount
        })
      }

      return {chain: this.chain, address: address, assets: assets}
    }

    getEthAssetObj() {
        return {
            ...this.genAssetObj(),
            priceName: "ethereum",
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

    getERC20(contract, address) {
      return new Promise((resolve, reject) => {
        axios.get(this.getERC20ApiUrl(contract, address)).then((response) => {
          const data = response.data
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    }

    getERC20ApiUrl = (contract, address) => (
      this.apiBaseUrl +
      "module=account&action=tokenbalance&" +
      "tag=latest&" +
      `apikey=${this.apiKey}` +
      `&contractaddress=${contract}` +
      `&address=${address}`
    )
}