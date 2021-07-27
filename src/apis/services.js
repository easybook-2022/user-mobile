import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const cancelPurchase = data => {
	return axios.post(
		`${WIFI_API_URL}/services/cancel_purchase`,
		data
	)
}

export const confirmPurchase = data => {
	return axios.post(
		`${WIFI_API_URL}/services/confirm_purchase`,
		data
	)
}

export const getServices = data => {
	return axios.post(
		`${WIFI_API_URL}/services/get_services`,
		data
	)
}

export const getServiceInfo = id => {
	return axios.get(`${WIFI_API_URL}/services/get_service_info/${id}`)
}
