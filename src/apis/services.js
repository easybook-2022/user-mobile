import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/services/`

export const cancelPurchase = data => {
	return axios.post(
		`${beginUrl}cancel_purchase`,
		data
	)
}

export const confirmPurchase = data => {
	return axios.post(
		`${beginUrl}confirm_purchase`,
		data
	)
}

export const getServices = data => {
	return axios.post(
		`${beginUrl}get_services`,
		data
	)
}

export const getServiceInfo = id => {
	return axios.get(`${beginUrl}get_service_info/${id}`)
}
