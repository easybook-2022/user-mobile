import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = WIFI_API_URL

export const getNumCartItems = (id) => {
	return axios.get(`${url}/carts/get_num_items/${id}`)
}

export const getCartItems = (id) => {
	return axios.get(`${url}/carts/get_cart_items/${id}`)
}

export const addItemtocart = (data) => {
	return axios.post(
		`${url}/carts/add_item_to_cart`,
		data
	)
}

export const removeFromCart = (id) => {
	return axios.get(`${url}/carts/remove_item_from_cart/${id}`)
}

export const checkoutCart = (data) => {
	return axios.post(
		`${url}/carts/checkout`,
		data
	)
}
