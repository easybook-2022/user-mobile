import axios from 'axios'
import { url } from '../../assets/info'

export const getItemInfo = id => {
	return axios.get(`${url}/items/get_item_info/${id}`)
}

export const cancelOrder = data => {
	return axios.post(
		`${url}/items/cancel_order`,
		data
	)
}

export const confirmOrder = data => {
	return axios.post(
		`${url}/items/confirm_order`,
		data
	)
}
