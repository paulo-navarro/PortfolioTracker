export default class {
    constructor() {

    }

    genAssetObj() {
        return {
            name: null,
            chain: null,
            freeBalance: 0,
            lockedBalance: 0,
            rewards: 0,
            totalBalance: 0
        }
    }

    calcDecimals = (value, decimals) => (parseInt(value) * 10 ** (decimals * -1))
}