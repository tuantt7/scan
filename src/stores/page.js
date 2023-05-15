import { defineStore } from 'pinia'

export const usePageStore = defineStore('dataPage', {
  state: () => ({ dataPage: 1 }),
  actions: {
    setPage(value) {
      this.dataPage = value
    }
  }
})
