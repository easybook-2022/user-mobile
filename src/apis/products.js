import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/products/`

export const getProductInfo = id => {
	return axios.get(`${beginUrl}get_product_info/${id}`)
}

export const cancelCartOrder = data => {
	return axios.post(
		`${beginUrl}cancel_cart_order`,
		data
	)
}

export const confirmCartOrder = data => {
	return axios.post(
		`${beginUrl}confirm_cart_order`,
		data
	)
}
