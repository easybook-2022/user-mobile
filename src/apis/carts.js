import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/carts/`

export const getNumCartItems = id => {
	return axios.get(`${beginUrl}get_num_items/${id}`)
}

export const getCartItems = id => {
	return axios.get(`${beginUrl}get_cart_items/${id}`)
}

export const getCartItemsTotal = id => {
	return axios.get(`${beginUrl}get_cart_items_total/${id}`)
}

export const editCartItem = id => {
	return axios.get(`${beginUrl}edit_cart_item/${id}`)
}

export const updateCartItem = data => {
	return axios.post(
		`${beginUrl}update_cart_item`,
		data
	)
}

export const addItemtocart = data => {
	return axios.post(
		`${beginUrl}add_item_to_cart`,
		data
	)
}

export const removeFromCart = id => {
	return axios.get(`${beginUrl}remove_item_from_cart/${id}`)
}

export const checkoutCart = data => {
	return axios.post(
		`${beginUrl}checkout`,
		data
	)
}

export const seeOrders = id => {
  return axios.get(`${beginUrl}see_orders/${id}`)
}
