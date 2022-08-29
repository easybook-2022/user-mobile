import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/products/`

export const getProductInfo = data => {
  const { productid, cancelToken } = data

	return axios.get(
    `${beginUrl}get_product_info/${productid}`,
    { cancelToken }
  )
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
