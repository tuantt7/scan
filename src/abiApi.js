import axios from 'axios'

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: 'https://abi-ttt.onrender.com'
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
