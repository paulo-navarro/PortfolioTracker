<template>
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
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { tAsset } from "src/chains/Chain";

export default defineComponent({
  name: "AssetCard",
  props: {
    assets: {
      type: Array<tAsset>,
      required: true
    }
  },
  data() {
    return {}
  },
  computed: {
    rows() {
      const rows = []

      this.assets.forEach(asset => {
        rows.push({
          symbol: asset.symbol,
          "free balance": asset.freeBalance,
          "locked balance": asset.lockedBalance,
          "rewards": asset.rewards,
          "total": asset.totalBalance
        })
      })

      return rows
    }
  }
});
</script>
