import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/carts/`

export const getNumCartItems = data => {
  const { userid, cancelToken } = data

	return axios.get(
    `${beginUrl}get_num_items/${userid}`,
    { cancelToken }
  )
}

export const getCartItems = data => {
  const { userid, cancelToken } = data

	return axios.get(
    `${beginUrl}get_cart_items/${userid}`,
    { cancelToken }
  )
}

export const editCartItem = data => {
  const { cartid, cancelToken } = data

	return axios.get(
    `${beginUrl}edit_cart_item/${cartid}`,
    { cancelToken }
  )
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

export const removeFromCart = data => {
  const { id, cancelToken } = data
	return axios.get(
    `${beginUrl}remove_item_from_cart/${id}`,
    { cancelToken }
  )
}

export const checkoutCart = data => {
	return axios.post(
		`${beginUrl}checkout`,
		data
	)
}

export const seeOrders = data => {
  const { userid, cancelToken } = data

  return axios.get(
    `${beginUrl}see_orders/${userid}`,
    { cancelToken }
  )
}
