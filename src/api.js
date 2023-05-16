import axios from 'axios'

const sepoliaNetwork = import.meta.env.VITE_SEPOLIA_NETWORK
const sepoliaURL = import.meta.env.VITE_SEPOLIA_URL
const mainnetURL = import.meta.env.VITE_MAIN_URL
const net = localStorage.getItem('net')
const networkUrl = net === sepoliaNetwork ? sepoliaURL : mainnetURL

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
  baseURL: networkUrl
})

export const postModel = (model, data, headers) => {
  return api.request({
    url: `${model}`,
    method: 'POST',
    data,
    headers
  })
}
export const getModel = (model, params) => {
  return api.request({
    url: `${model}`,
    params,
    method: 'GET',
    headers: {}
  })
}
