<template>
  <div class="PortfolioTotal">

    <div class="q-pa-md">
      <q-table
        style="height: 100%"
        flat bordered
        :rows="rows"
        row-key="index"
        virtual-scroll
        :rows-per-page-options="[200]"
        hide-bottom
      />
    </div>
  </div>
</template>

<script lang="ts">
import { tWallet, tAsset } from "src/chains/Chain";
import { defineComponent } from "vue"
import axios from "axios"

export default defineComponent({
  name: "PortfolioTotal",
  props: {
    wallets: {
      type: Array<tWallet>,
      required: true
    }
  },
  data() {
    return {
      assets: [] as tAsset[],
      fiatCurrencies: ["usd","brl"],
      fiatPrices: null,
      priceInterval: null as null | NodeJS.Timeout,
      assetsInterval: null as null | NodeJS.Timeout,
      supportedChains: ["cosmos","efinity","ethereum","injective-protocol","near","polkadot","aave"]
    }
  },
  computed: {
    rows() {
      const rows:Array = []
      const rowTotal = {symbol: "TOTAL"}
      this.assets.forEach(asset => {
        let row = {
          symbol: asset.symbol,
          amount: asset.totalBalance
        }
        if(this.fiatPrices) {
          const fiatValues = this.fiatPrices[asset.priceName]
          if (fiatValues) {
              Object.keys(fiatValues).forEach(cur => {
              row[cur] = (parseFloat(fiatValues[cur]) * asset.totalBalance).toFixed(2)
              rowTotal[cur] = rowTotal[cur] ? (parseFloat(rowTotal[cur]) + parseFloat(row[cur])).toFixed(2) : row[cur]
            })
          }
        }

        rows.push(row)
      })

      rows.push(rowTotal)

      return rows
    },

    fiatTotalValues () {
      let totalValues = {}
      this.fiatCurrencies.forEach(cur => {
        totalValues[cur] = 0
      })
      if (this.assets) {
          Object.keys(this.assets).forEach(symbol =>{
             this.fiatCurrencies.forEach(cur => {
                if(this.assets[symbol]?.fiatBalances?.[cur])
                  totalValues[cur] += parseFloat(this.assets[symbol].fiatBalances?.[cur])
            })
          })
      }

      return totalValues
    }
  },
  mounted() {
    this.getFiatPrices()
    this.getAllAssets()
    this.priceInterval = setInterval(() => this.getFiatPrices(), 30000)
    this.assetsInterval = setInterval(() => this.getAllAssets(), 1000)
  },
  methods: {
    getFiatPrices() {
      if(this.fiatCurrencies) {
        let url = `https://api.coingecko.com/api/v3/simple/price?ids=${this.supportedChains.toString()}&vs_currencies=${this.fiatCurrencies.toString()}`
        axios.get(url).then((response) => {
          const data = response.data
          this.fiatPrices = data
        })
      }
    },
    getAllAssets() {
      const assets:tAsset[] = []
      const wallets:tWallet[] = JSON.parse(JSON.stringify(this.wallets))
      wallets.forEach(wallet => {
        wallet.assets?.forEach(asset => {
          const existing = assets.filter(ass => asset.symbol === ass.symbol)
          if (existing.length === 0) {
            assets.push(asset)
          } else {
            existing[0].totalBalance += asset.totalBalance
          }
        })
      })
      this.assets = assets
    }
  }
});
</script>
