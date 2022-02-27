import axios from 'axios'
import { url } from '../../assets/info'

export const getNumCartItems = id => {
	return axios.get(`${url}/carts/get_num_items/${id}`)
}

export const getCartItems = id => {
	return axios.get(`${url}/carts/get_cart_items/${id}`)
}

export const getCartItemsTotal = id => {
	return axios.get(`${url}/carts/get_cart_items_total/${id}`)
}

export const editCartItem = id => {
	return axios.get(`${url}/carts/edit_cart_item/${id}`)
}

export const updateCartItem = data => {
	return axios.post(
		`${url}/carts/update_cart_item`,
		data
	)
}

export const addItemtocart = data => {
	return axios.post(
		`${url}/carts/add_item_to_cart`,
		data
	)
}

export const removeFromCart = id => {
	return axios.get(`${url}/carts/remove_item_from_cart/${id}`)
}

export const checkoutCart = data => {
	return axios.post(
		`${url}/carts/checkout`,
		data
	)
}

export const seeOrders = id => {
  return axios.get(`${url}/carts/see_orders/${id}`)
}
