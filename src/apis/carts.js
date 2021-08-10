import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const getNumCartItems = id => {
	return axios.get(`${WIFI_API_URL}/carts/get_num_items/${id}`)
}

export const getCartItems = id => {
	return axios.get(`${WIFI_API_URL}/carts/get_cart_items/${id}`)
}

export const editCartItem = id => {
	return axios.get(`${WIFI_API_URL}/carts/edit_cart_item/${id}`)
}

export const updateCartItem = data => {
	return axios.post(
		`${WIFI_API_URL}/carts/update_cart_item`,
		data
	)
}

export const addItemtocart = data => {
	return axios.post(
		`${WIFI_API_URL}/carts/add_item_to_cart`,
		data
	)
}

export const removeFromCart = id => {
	return axios.get(`${WIFI_API_URL}/carts/remove_item_from_cart/${id}`)
}

export const editCallfor = id => {
	return axios.get(`${WIFI_API_URL}/carts/edit_call_for/${id}`)
}

export const updateCallfor = data => {
	return axios.post(
		`${WIFI_API_URL}/carts/update_call_for`,
		data
	)
}

export const removeCallfor = data => {
	return axios.post(
		`${WIFI_API_URL}/carts/remove_call_for`,
		data
	)
}

export const checkoutCart = data => {
	return axios.post(
		`${WIFI_API_URL}/carts/checkout`,
		data
	)
}
