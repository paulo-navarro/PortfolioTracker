<template>
  <div class="fit row wrap justify-center items-start content-start q-pa-md" >
    <span class="q-pa-sm" style="min-width: 300px;">
      <q-select
        standout
        stack-label
        v-model="chain"
        :options="chainsOptions"
        label="CHAIN"
        :dense="false"
        :options-dense="false"
        :error="chainError"
        error-message="Select a Chain"
        @focus="clearChainError"
      />
    </span>
    <span class="q-pa-sm" style="min-width: 300px;">
      <q-input
        standout
        v-model="address"
        :error="addressError"
        error-message="Add an wallet address"
        label="ADDRESS"
        @focus="clearAddressError"
      />
    </span>
    <span class="q-pa-sm row items-center" style="height: 72px;">
      <q-btn
        round
        color="primary"
        icon="add"
        @click="add"
      />
    </span>
  </div>
</template>

<script lang="ts">
import { QSelect, useQuasar } from 'quasar'

export default {
  name: 'SearchWallet',
  props: {
    chainsOptions: {
      type: Array,
    },
  },
  data() {
    return {
      address: null,
      chain: null as null | QSelect,
      chainError: false,
      addressError: false,
    }
  },
  mounted() {
    const $q = useQuasar()
    $q.dark.set(true)
  },
  methods: {
    add() {
      if (this.isValid()) {
        this.$emit('addWallet', {chain: this.chain?.value, address: this.address})
      }
    },
    isValid() {
      if(this.chain === null) {
        this.chainError = true
        return false
      }
      if(this.address === null) {
        this.addressError = true
        return false
      }

      return true
    },
    clearChainError() {
      this.chainError = false
    },
    clearAddressError() {
      this.addressError = false
    }
  }
}

</script>
