<template>
  <q-page
    v-if="chainsOptions"
    class="full-width column wrap justify-start items-start content-center"
  >
    <search-wallet
      :chainsOptions="chainsOptions"
      @add-wallet="addWallet"
    />

    

    <div
      v-if="wallets.length > 0"
      class="column content-center justify-center q-pa-md items-top"
      style="width: 100%;"
    >
      <PortfolioTotal
        style="max-width: 830px; width: 100%;"
        :wallets="wallets"
      />

      <q-list
        bordered
        class="rounded-borders q-pa-md"
        style="max-width: 800px; width: 100%;"
      >
        <q-expansion-item 
          v-for="(wallet, index) in wallets"
          :key="index"
        >
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar 
                :icon="wallet.chain"
                :color="chains[wallet.chain]['color']"
                text-color="white"
                :title="wallet.chain"
              >
                <ChainLogo :chain="wallet.chain"/>
              </q-avatar>
            </q-item-section>

            <q-item-section style="flex: 0 1 80px;">
              {{ wallet.chain }}
            </q-item-section>

            <q-item-section style="flex: 1 1 auto;">
                {{ wallet.address }}
            </q-item-section>
            <q-item-section style="flex: 0 0 auto;">
              <q-btn
                round
                :color="isFavorited(wallet.address) ? 'primary' : 'gray'"
                icon="favorite"
                @click="(e) => favWallet(e, wallet)"
              />
            </q-item-section>
          </template>

          <asset-card v-if="wallet.assets" :assets="wallet.assets"/>
        </q-expansion-item>
        <q-separator />
      </q-list>
    </div>

  </q-page>
</template>

<script lang="ts">
import AssetCard from "src/components/AssetCard.vue"
import SearchWallet from "src/components/SearchWallet.vue"
import ChainLogo from "src/components/ChainLogo.vue"
import PortfolioTotal from "src/components/PortfolioTotal.vue"

import { defineComponent } from "vue"
import CHAINS from "../chains/Chains"
import { tWallet } from "src/chains/Chain"



export default defineComponent({
  name: "PortfolioTracker",
  components: { AssetCard, ChainLogo, PortfolioTotal, SearchWallet },
  data() {
    return {
      chains: CHAINS,
      wallets: [] as tWallet[],
      favoriteWallets: [] as tWallet[]
    }
  },
  computed: {
    chainsOptions() {
      let options: {label: string, value: string|null}[] = []
      Object.keys(this.chains).forEach(key => {
        options.push({label: this.chains[key].name, value: this.chains[key].chain})
      })

      return options
    }
  },
  mounted() {
    const storedFavorites:string|null = localStorage.getItem("favoriteWallets")
    if(storedFavorites) {
      this.favoriteWallets = JSON.parse(storedFavorites)
    }
    if (this.favoriteWallets) {
      this.favoriteWallets.forEach((wallet) =>{
        this.addWallet(wallet)
      })
    }
  },
  methods: {
    async addWallet(wallet: tWallet) {
      if (this.chains[wallet.chain] === undefined)
        return
      const newWallet = await this.chains[wallet.chain].helper.getWallet(wallet.address)
      if(newWallet !== null) {
        this.wallets.push(newWallet)
      }
    },
    favWallet(e:Event, wallet: tWallet) {
      e.stopPropagation()
      const favoriteWallet: tWallet = {
        chain: wallet.chain,
        address: wallet.address
      }
      const index = this.favoriteWallets.findIndex(fav => fav?.chain === favoriteWallet?.chain && fav?.address === favoriteWallet?.address)

      if(index === -1) {
        this.favoriteWallets.push(favoriteWallet)
      } else {
        this.favoriteWallets.splice(index, 1);
      }

      localStorage.setItem("favoriteWallets",JSON.stringify(this.favoriteWallets))
    },

    isFavorited(address:string) {
      const fav = this.favoriteWallets.filter(fw => fw.address === address)

      return fav.length > 0
    }
  }
});
</script>
