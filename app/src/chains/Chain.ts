
export type tFiatPrice = {
    string: number
}

export type tAsset = {
    symbol: string
    priceName: string
    chain: string
    freeBalance: number
    lockedBalance: number
    rewards: number
    totalBalance: number
    fiatBalances?: tFiatPrice[]
}

export type tWallet = {
    chain: string
    address: string
    assets?: tAsset[]
}

export default class {

    genAssetObj() :tAsset{
        return {
            symbol: "",
            priceName: "",
            chain: "",
            freeBalance: 0,
            lockedBalance: 0,
            rewards: 0,
            totalBalance: 0
        }
    }

    calcDecimals = (value:string, decimals:number):number => (parseInt(value) * 10 ** (decimals * -1))

    cloneObj = (obj:any) => (
        JSON.parse(JSON.stringify(obj))
    )
}