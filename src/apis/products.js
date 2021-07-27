import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const getProducts = data => {
	return axios.post(
		`${WIFI_API_URL}/products/get_products`,
		data
	)
}

export const getProductInfo = id => {
	return axios.get(`${WIFI_API_URL}/products/get_product_info/${id}`)
}

export const cancelOrder = id => {
	return axios.get(`${WIFI_API_URL}/products/cancel_order/${id}`)
}

export const confirmOrder = data => {
	return axios.post(
		`${WIFI_API_URL}/products/confirm_order`,
		data
	)
}
