<template>
  <section id="app" class="PortfolioTracker">
    <select
      v-model = "selectedChain"
    >
      <option :value="null">Select Chain</option>
      <option
        v-for="(chain, index) in chains"
        :key="index"
        :value="chain.chain">
          {{chain.name}}
      </option>
    </select>
    <input v-model="formWallet"/>
    <button
      @click="addWalletFromForm"
    >
      +
    </button>
    
    <section>
      <table
        v-if="wallets.length > 0"
        class="PortfolioTracker-wallets"
      >
      <tr>
        <td colspan="2"></td>
        <td v-for="(fiat, index) in fiatCurrencies" :key="index">
          {{fiat}} value
        </td>
      </tr>
      <tr
        v-for="(value, symbol) in assets"
        :key="symbol"
      >
        <td>
          {{symbol}}
        </td>
        <td>
          {{value.balance}}
        </td>
        <td
          v-for="(fiat, index) in fiatCurrencies"
          :key="index"
        >
          <span v-if="value.fiatBalances?.[fiat]">
            {{value.fiatBalances?.[fiat]}}
        </span>
        <span v-else>-</span>
        </td>
      </tr>
      <tr>
        <td colspan="2"></td>
        <td v-for="(value, currency) in fiatTotalValues" :key="currency">
          {{ value.toFixed(2) }}
        </td>
      </tr>
      </table>
    </section>
    
    <table
      v-if="wallets.length > 0"
      class="PortfolioTracker-wallets"
    >
      <tr>
        <td></td>
        <td>Asset</td>
        <td>Free</td>
        <td>Locked</td>
        <td>Rewards</td>
        <td>Total</td>
      </tr>
      <tbody
        v-for="(wallet, index) in wallets"
        :key="index"
        class="PortfolioTracker-walletAssets"
      >
        <tr class="PortfolioTracker-wallets-id">
          <td>{{wallet.chain}}</td>
          <td colspan="3">{{wallet.address}}</td>
          <td colspan="90"><button @click="favWallet(wallet)">+</button></td>
        </tr>
        <tr
          v-for="(asset, i2) in wallet.assets"
          :key="i2"
        >
          <td></td>
          <td>{{asset.name}}</td>
          <td>{{asset.freeBalance}}</td>
          <td>{{asset.lockedBalance}}</td>
          <td>{{asset?.rewards}}</td>
          <td>{{asset.totalBalance}}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script>
import axios from 'axios';
import Cosmos from "../chains/Cosmos"
import Near from "../chains/Near"
import Ethereum from "../chains/Ethereum"
import Polkadot from "../chains/Polkadot"

const CHAINS = {
  cosmos: {
    chain: "cosmos",
    name: "Cosmos Hub",
    helper: new Cosmos("cosmos")
  },

  near: {
    chain: "near",
    name: "Near Protocol",
    helper: new Near()
  },

  efinity: {
    chain: "efinity",
    name: "Efinity",
    helper: new Polkadot("efinity")
  },

  ethereum: {
    chain: "ethereum",
    name: "Ethereum",
    helper: new Ethereum()
  },

  "injective-protocol": {
    chain: "injective-protocol",
    name: "Injective Protocol",
    helper: new Cosmos("injective-protocol")
  },

  polkadot: {
    chain: "polkadot",
    name: "Polkadot",
    helper: new Polkadot("polkadot")
  }
}

export default {
  name: "HomePage",
  data() {
    return {
      chains: CHAINS,
      selectedChain: null,
      formWallet: null,
      wallets: [],
      favoriteWallets: [],
      fiatCurrencies: ["usd","brl"],
      fiatPrices: null,
      priceInterval: null,
      supportedChains: ["cosmos","efinity","ethereum","injective-protocol","near","polkadot"]
    }
  },

  mounted() {
    const storedFavorites = JSON.parse(localStorage.getItem("favoriteWallets"))
    if(storedFavorites) {
      this.favoriteWallets = storedFavorites
    }
    if (this.favoriteWallets) {
      this.favoriteWallets.forEach((wallet) =>{
        this.addWallet(wallet.chain, wallet.address)
      })
    }

    this.getFiatPrices()
    this.priceInterval = setInterval(() => this.getFiatPrices(), 10000)
  },

  beforeUnmount() {
    clearInterval(this.priceInterval)
  },

  computed:{
    assets() {
      let assets = {}
      this.wallets.forEach(wallet => {
        wallet.assets.forEach(asset => {
          if (assets[asset.name] === undefined) {
            assets[asset.name] = {
              balance: 0,
              chain: asset.chain,
              fiatPrices: this.fiatPrices?.[asset.chain] ? this.fiatPrices?.[asset.chain] : null,
              fiatBalances: null,
            }
          }
          
          assets[asset.name].balance += asset.totalBalance
          if (assets[asset.name].fiatPrices) {
            assets[asset.name].fiatBalances = {}
            Object.keys(assets[asset.name].fiatPrices).forEach(fiat =>{
              assets[asset.name].fiatBalances[fiat] = (assets[asset.name].fiatPrices[fiat] * assets[asset.name].balance).toFixed(2)
            })
          }
        })
      })

      return assets
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

  methods: {
    async addWallet(chain, address) {
      if (this.chains[chain] === undefined)
        return
      const wallet = await this.chains[chain].helper.getWallet(address)
      if(wallet !== null) {
        this.wallets.push(wallet)
      }
    },
    addWalletFromForm() {
      this.addWallet(this.selectedChain, this.formWallet)
      this.formWallet = null
    },
    favWallet(wallet) {
      const favoriteWallet = {
        chain: wallet.chain,
        address: wallet.address
      }
      const duplicated = this.favoriteWallets.filter(fav => fav?.chain === favoriteWallet?.chain && fav?.address === favoriteWallet?.address)

      if(duplicated.length === 0) {
        this.favoriteWallets.push(favoriteWallet)
        localStorage.setItem('favoriteWallets',JSON.stringify(this.favoriteWallets))
      }
    },
    getFiatPrices() {

      if(this.fiatCurrencies) {
        let url = `https://api.coingecko.com/api/v3/simple/price?ids=${this.supportedChains.toString()}&vs_currencies=${this.fiatCurrencies.toString()}`
        axios.get(url).then((response) => {
          const data = response.data
          this.fiatPrices = data
        })
      }
    }
  },
}
</script>

<style lang="scss" scoped>
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&display=swap');

  :root {

  }
  .PortfolioTracker {
    display: inline-block;
    margin: 5px auto;
    padding: 20px;
    font-family: 'Roboto', sans-serif;
    background-color: #000;
    border-radius: 5px;
    color: #c5c5c5;

    &-wallets {
      margin: 10px auto;
      border-collapse: collapse;
      
      &-id {
        background-color: #1f1f1f;
      }
      
      & td {
        padding: 10px;
        border: 1px solid #1f1f1f;
      }
    }
    
  }
</style>
