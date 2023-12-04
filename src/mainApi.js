import axios from 'axios'
import { useToast } from 'vue-toast-notification'
const $toast = useToast()
const URL = import.meta.env.VITE_BACKEND_URL
const network = localStorage.getItem('net')

const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  baseURL: 'http://localhost:3008'
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    errorMessage(error)
    return Promise.reject(error)
  }
)

const errorMessage = (error) => {
  const { message } = error.response.data
  const { status, statusText } = error.response
  $toast.open({
    message: `${status}: ${statusText}. ${message ?? ''}`,
    type: 'error',
    duration: 5000,
    position: 'top-right',
    dismissible: true
  })
}

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
