import { defineStore } from 'pinia'

export const useAddressStore = defineStore('address', {
  state: () => ({
    transactions: [],
    dataPage: 1,
    offset: 10000,
    time: 1
  }),
  getters: {
    tranLength(state) {
      return state.transactions.length
    }
  },
  actions: {
    setTransactions(value) {
      this.transactions = [...value]
    },
    pushTransactions(value) {
      this.transactions = [...this.transactions, ...JSON.parse(JSON.stringify(value))]
    },
    setPage(value) {
      this.dataPage = value
    },
    setTime() {
      this.time += 1
    }
  }
})
