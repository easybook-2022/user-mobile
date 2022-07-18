import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/orders/`

export const getNumOrders = id => {
	return axios.get(`${beginUrl}get_num_orders/${id}`)
}

export const getOrder = id => {
	return axios.get(`${beginUrl}get_order/${id}`)
}

export const getOrderTotal = id => {
	return axios.get(`${beginUrl}get_order_total/${id}`)
}

export const editOrderItem = id => {
	return axios.get(`${beginUrl}edit_order_item/${id}`)
}

export const updateOrderItem = data => {
	return axios.post(
		`${beginUrl}update_order_item`,
		data
	)
}

export const addItemtoOrder = data => {
	return axios.post(
		`${beginUrl}add_item_to_order`,
		data
	)
}

export const removeFromOrder = id => {
	return axios.get(`${beginUrl}remove_item_from_order/${id}`)
}

export const checkoutOrder = data => {
	return axios.post(
		`${beginUrl}checkout`,
		data
	)
}

export const seeOrders = id => {
  return axios.get(`${beginUrl}see_orders/${id}`)
}
