import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = WIFI_API_URL

export const getProducts = (data) => {
	return axios.post(
		`${url}/products/get_products`,
		data
	)
}

export const getProductInfo = (data) => {
	return axios.post(
		`${url}/products/get_product_info`,
		data
	)
}

export const cancelPurchase = (id) => {
	return axios.get(`${url}/products/cancel_purchase/${id}`)
}

export const confirmPurchase = (data) => {
	return axios.post(
		`${url}/products/confirm_purchase`,
		data
	)
}
