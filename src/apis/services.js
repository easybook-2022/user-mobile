import axios from 'axios'
import { url } from '../../assets/info'

export const cancelPurchase = data => {
	return axios.post(
		`${url}/services/cancel_purchase`,
		data
	)
}

export const confirmPurchase = data => {
	return axios.post(
		`${url}/services/confirm_purchase`,
		data
	)
}

export const getServices = data => {
	return axios.post(
		`${url}/services/get_services`,
		data
	)
}

export const getServiceInfo = id => {
	return axios.get(`${url}/services/get_service_info/${id}`)
}
