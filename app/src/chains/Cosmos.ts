import axios from "axios"
import Chain from "./Chain"
import {tAsset, tWallet} from "./Chain"

export default class Cosmos extends Chain {

  chain: string
  decimals: number
  stakeApiUrl: string
  balanceApiUrl: string
  rewardsApiUrl: string

  constructor(chain:string) {
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

    async getWallet(address:string):Promise<tWallet> {
        const free = await this.getFreeBalance(address)
        const locked = await this.getLockedBalance(address)
        const rewards = await this.getRewards(address)

        const assets:tAsset[] = []
        
        free.balances.forEach((asset:any) => {
            const amount = this.calcDecimals(asset.amount, this.decimals)
            const symbol = this.getSymbol(asset.denom)

            if (!symbol)
                return

            assets.push({
                ...this.getCosmoAssetObj(),
                symbol: symbol,
                priceName: this.getPriceName(asset.denom),
                freeBalance: amount,
                totalBalance: amount
            })
        })

        locked.delegation_responses.forEach((delegation:any) => {
          const assetIndex = assets.findIndex((asset) => asset.symbol === this.getSymbol(delegation.balance.denom))
          const amount = this.calcDecimals(delegation.balance.amount, this.decimals)
          const symbol = this.getSymbol(delegation.balance.denom)

          if (!symbol)
            return

          if (assetIndex >= 0) {
            assets[assetIndex].lockedBalance = amount
            assets[assetIndex].totalBalance = assets[assetIndex].totalBalance + amount
          } else {
            assets.push({
              ...this.getCosmoAssetObj(),
              symbol: this.getSymbol(delegation.balance.denom),
              priceName: this.getPriceName(delegation.balance.denom),
              lockedBalance:amount,
              totalBalance: amount
            })
          }
        })

        rewards.rewards.forEach((validator:any) => {
            validator.reward.forEach((reward:any) => {
                const assetIndex = assets.findIndex((asset) => asset.symbol === this.getSymbol(reward.denom))
                const amount = this.calcDecimals(reward.amount, this.decimals)
                const symbol = this.getSymbol(reward.denom)

                if (!symbol)
                    return

                    if (assetIndex >= 0) {
                    assets[assetIndex].rewards = amount
                    assets[assetIndex].totalBalance = assets[assetIndex].totalBalance + amount
                  } else {
                    const cosmObj:tAsset = this.getCosmoAssetObj()
                    cosmObj.symbol = this.getSymbol(reward.denom)
                    cosmObj.priceName = this.getPriceName(reward.denom)
                    cosmObj.rewards = amount
                    cosmObj.totalBalance = amount
 
                    assets.push(this.cloneObj(cosmObj))
                }
            })
        })


      return {chain: this.chain, address: address, assets: assets}
    }
  
    getSymbol(denom:string):string {
      let symbol= ""
      switch(denom) {
        case "uatom": symbol = "ATOM"; break;
        case "inj": symbol = "INJ"; break;
      }
  
      return symbol
    }

    getPriceName(denom:string):string {
      let name = ""
      switch(denom) {
        case "uatom": name = "cosmos"; break;
        case "inj": name = "injective-protocol"; break;
      }
  
      return name
    }

    getCosmoAssetObj():tAsset {
      const assetObj = this.genAssetObj()
      assetObj.chain = this.chain
      
      return this.cloneObj(assetObj)
    }

    getFreeBalance(wallet:string):any {
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
  
    getLockedBalance(wallet:string):any {
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

    getRewards(wallet:string):any {
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