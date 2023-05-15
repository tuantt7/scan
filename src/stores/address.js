import { defineStore } from 'pinia'

export const useAddressStore = defineStore('address', {
  state: () => ({ transactions: [], dataPage: 1 }),
  actions: {
    setTransactions(value) {
      this.transactions = [...value]
    },
    pushTransactions(value) {
      this.transactions = [...this.transactions, ...JSON.parse(JSON.stringify(value))]
    },
    setPage(value) {
      this.dataPage = value
    }
  }
})
