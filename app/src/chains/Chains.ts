import Cosmos from "./Cosmos"
import Near from "./Near"
import Ethereum from "./Ethereum"
import Polkadot from "./Polkadot"

interface tChain {
  chain: string
  name: string
  color: string
  helper: any // You might want to replace 'any' with the actual type of helper
}
  
interface ChainObject {
  [key: string]: tChain;
}
  
const CHAINS: ChainObject = {
  cosmos: {
    chain: "cosmos",
    name: "Cosmos Hub",
    color: "transparent",
    helper: new Cosmos("cosmos")
  },

  near: {
    chain: "near",
    name: "Near Protocol",
    color: "green",
    helper: new Near()
  },

  efinity: {
    chain: "efinity",
    name: "Efinity",
    color: "purple",
    helper: new Polkadot("efinity")
  },

  ethereum: {
    chain: "ethereum",
    name: "Ethereum",
    color: "white",
    helper: new Ethereum()
  },

  "injective-protocol": {
    chain: "injective-protocol",
    name: "Injective Protocol",
    color: "transparent",
    helper: new Cosmos("injective-protocol")
  },

  polkadot: {
    chain: "polkadot",
    name: "Polkadot",
    color: "white",
    helper: new Polkadot("polkadot")
  }
}

export default CHAINS