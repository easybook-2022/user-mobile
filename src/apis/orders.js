import axios from 'axios'
import { url } from '../../assets/info'

export const getNumOrders = id => {
	return axios.get(`${url}/orders/get_num_orders/${id}`)
}

export const getOrder = id => {
	return axios.get(`${url}/orders/get_order/${id}`)
}

export const getOrderTotal = id => {
	return axios.get(`${url}/orders/get_order_total/${id}`)
}

export const editOrderItem = id => {
	return axios.get(`${url}/orders/edit_order_item/${id}`)
}

export const updateOrderItem = data => {
	return axios.post(
		`${url}/orders/update_order_item`,
		data
	)
}

export const addItemtoOrder = data => {
	return axios.post(
		`${url}/orders/add_item_to_order`,
		data
	)
}

export const removeFromOrder = id => {
	return axios.get(`${url}/orders/remove_item_from_order/${id}`)
}

export const checkoutOrder = data => {
	return axios.post(
		`${url}/orders/checkout`,
		data
	)
}

export const seeOrders = id => {
  return axios.get(`${url}/orders/see_orders/${id}`)
}
