import axios from "axios"
import Chain from "./Chain"

export default class Cosmos extends Chain{
    constructor(chain) {
        super()
        this.chain = chain
        this.decimals = 6
        let urlChain = "cosmoshub-lcd"

        switch(this.chain) {
            case "injective-protocol":
            urlChain = "inj-lcd";
            this.decimals = 18
            break;
        }
        const baseUrl = `https://proxy.atomscan.com/${urlChain}/cosmos`

        this.stakeApiUrl=`${baseUrl}/staking/v1beta1/delegations/`
        this.balanceApiUrl=`${baseUrl}/bank/v1beta1/balances/`
        this.rewardsApiUrl=`${baseUrl}/distribution/v1beta1/delegators/`
    }

    async getWallet(address) {
        const free = await this.getFreeBalance(address)
        const locked = await this.getLockedBalance(address)
        const rewards = await this.getRewards(address)

        let assets = []
        
        free.balances.forEach((asset) => {
            const amount = this.calcDecimals(asset.amount, this.decimals)
            const name = this.getName(asset.denom)

            if (!name)
                return

            assets.push({
                ...this.getCosmoAssetObj(),
                name: name,
                freeBalance: amount,
                totalBalance: amount
            })
        })

        locked.delegation_responses.forEach((delegation) => {
          let assetIndex = assets.findIndex((asset) => asset.name === this.getName(delegation.balance.denom))
          const amount = this.calcDecimals(delegation.balance.amount, this.decimals)
          const name = this.getName(delegation.balance.denom)

          if (!name)
            return

          if (assetIndex >= 0) {
            assets[assetIndex].lockedBalance = amount
            assets[assetIndex].totalBalance = assets[assetIndex].totalBalance + amount
          } else {
            assets.push({
              ...this.getCosmoAssetObj(),
              name: this.getName(delegation.balance.denom),
              lockedBalance:amount,
              totalBalance: amount
            })
          }
        })

        rewards.rewards.forEach(validator => {
            validator.reward.forEach(reward => {
                let assetIndex = assets.findIndex((asset) => asset.name === this.getName(reward.denom))
                const amount = this.calcDecimals(reward.amount, this.decimals)
                const name = this.getName(reward.denom)

                if (!name)
                    return

                    if (assetIndex >= 0) {
                    assets[assetIndex].rewards = amount
                    assets[assetIndex].totalBalance = assets[assetIndex].totalBalance + amount
                  } else {
                    assets.push({
                      ...this.getCosmoAssetObj,
                      name: this.getName(reward.denom),
                      rewards: amount,
                      totalBalance: amount
                    })
                }
            })
        })


      return {chain: this.chain, address: address, assets: assets}
    }
  
    getName(denom) {
      let name = null
      switch(denom) {
        case "uatom": name = "ATOM"; break;
        case "inj": name = "INJ"; break;
      }
  
      return name
    }

    getCosmoAssetObj() {
        return {
            ...this.genAssetObj(),
            chain: this.chain,
        }
    }

    getFreeBalance(wallet) {
      const url = this.balanceApiUrl + wallet
      return new Promise((resolve, reject) => {
        axios.get(url).then((response) => {
          const data = response.data
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    }
  
    getLockedBalance(wallet) {
        const url = this.stakeApiUrl + wallet
        return new Promise((resolve, reject) => {
            axios.get(url).then((response) => {
            const data = response.data
            resolve(data)
            }).catch(error => {
                reject(error)
            });
        })
    }

    getRewards(wallet) {
        const url = `${this.rewardsApiUrl}${wallet}/rewards`
        return new Promise((resolve, reject) => {
            axios.get(url).then((response) => {
            const data = response.data
            resolve(data)
            }).catch(error => {
                reject(error)
            });
        })
    }
  }