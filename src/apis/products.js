import axios from 'axios'
import { local_api_url, wifi_api_url } from '../../assets/info'

export const getProducts = data => {
	return axios.post(
		`${wifi_api_url}/products/get_products`,
		data
	)
}

export const getProductInfo = id => {
	return axios.get(`${wifi_api_url}/products/get_product_info/${id}`)
}

export const cancelOrder = data => {
	return axios.post(
		`${wifi_api_url}/products/cancel_order`,
		data
	)
}

export const confirmOrder = data => {
	return axios.post(
		`${wifi_api_url}/products/confirm_order`,
		data
	)
}
