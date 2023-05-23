import axios from 'axios'
const URL = import.meta.env.VITE_BACKEND_URL
const network = localStorage.getItem('net')

const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  baseURL: URL
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
  params.net = network
  return api.request({
    url: `${model}`,
    params,
    method: 'GET',
    headers: {}
  })
}
