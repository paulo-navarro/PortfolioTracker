import axios from "axios"
import Chain from "./Chain"

export default class Polkadot extends Chain {
    constructor(chain) {
        super()
        this.chain = chain
        this.dotDecimal = 10

        this.apiBaseUrl = `https://${this.chain}.webapi.subscan.io/api/scan/`
        this.apiUrl     = `${this.apiBaseUrl}multiChain/account`
        this.apiRewards = `${this.apiBaseUrl}nomination_pool/rewards`
    }

    async getWallet(address) {
      const balance = await this.getBalance(address)
      let assets = []
  
      balance.forEach((asset) => {
          const amount = this.calcDecimals(asset.balance, asset.decimal)

          const lockedBalance = parseFloat(asset.bonded) +
                                parseFloat(asset.conviction_lock) +
                                parseFloat(asset.democracy_lock) +
                                parseFloat(asset.election_lock) +
                                parseFloat(asset.locked) +
                                parseFloat(asset.reserved) +
                                parseFloat(asset.unbonding) +
                                this.calcDecimals(asset.nomination_bonded, asset.decimal);
          assets.push({
            ...this.getPolkaAssetObj(),
            name: asset.symbol,
            freeBalance: amount,
            lockedBalance: lockedBalance,
            totalBalance: amount + lockedBalance
          })
      })

      if (this.chain === "polkadot") {
        const rewards = await this.getRewards(address)
        let amount = 0
        rewards.list.forEach(reward => {
            amount = amount + parseFloat(reward.amount)
        })

        assets[0].rewards = this.calcDecimals(amount, this.dotDecimal)
        assets[0].totalBalance += assets[0].rewards
      }

      return {chain: this.chain, address: address, assets: assets}
    }

    getPolkaAssetObj() {
        return {
            ...this.genAssetObj(),
            chain: this.chain,
        }
    }
  
    getBalance(address) {
      return new Promise((resolve, reject) => {
        axios.post(this.apiUrl, {address: address}).then((response) => {
          const data = response.data.data
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    }

    getRewards(address) {
        return new Promise((resolve, reject) => {
          axios.post(this.apiRewards, {address: address}).then((response) => {
            const data = response.data.data
            resolve(data)
          }).catch(error => {
            reject(error)
          })
        })
      }
  }