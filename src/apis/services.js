import axios from 'axios'
import { local_api_url, wifi_api_url } from '../../assets/info'

export const cancelPurchase = data => {
	return axios.post(
		`${wifi_api_url}/services/cancel_purchase`,
		data
	)
}

export const confirmPurchase = data => {
	return axios.post(
		`${wifi_api_url}/services/confirm_purchase`,
		data
	)
}

export const getServices = data => {
	return axios.post(
		`${wifi_api_url}/services/get_services`,
		data
	)
}

export const getServiceInfo = id => {
	return axios.get(`${wifi_api_url}/services/get_service_info/${id}`)
}
