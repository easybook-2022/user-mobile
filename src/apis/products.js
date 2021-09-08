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

export const cancelCartOrder = data => {
	return axios.post(
		`${url}/products/cancel_cart_order`,
		data
	)
}

export const confirmCartOrder = data => {
	return axios.post(
		`${url}/products/confirm_cart_order`,
		data
	)
}
