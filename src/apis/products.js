import axios from 'axios'
import { url } from '../../assets/info'

export const getProducts = data => {
	return axios.post(
		`${url}/products/get_products`,
		data
	)
}

export const getProductInfo = id => {
	return axios.get(`${url}/products/get_product_info/${id}`)
}

export const cancelOrder = data => {
	return axios.post(
		`${url}/products/cancel_order`,
		data
	)
}

export const confirmOrder = data => {
	return axios.post(
		`${url}/products/confirm_order`,
		data
	)
}
