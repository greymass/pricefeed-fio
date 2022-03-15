import axios from 'axios'

export const binance = axios.create({
    baseURL: 'https://api.binance.com/api/v3/',
    timeout: 3000,
})
