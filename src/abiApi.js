import axios from 'axios'
const abiURL = import.meta.env.VITE_ABI_URL

const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  baseURL: abiURL
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
