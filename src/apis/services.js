import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = LOCAL_API_URL

export const cancelPurchase = (data) => {
	return axios.post(
		`${url}/services/cancel_purchase`,
		data
	)
}

export const confirmPurchase = (data) => {
	return axios.post(
		`${url}/services/confirm_purchase`,
		data
	)
}

export const cancelRequest = (data) => {
	return axios.post(
		`${url}/services/cancel_request`,
		data
	)
}

export const confirmRequest = (data) => {
	return axios.post(
		`${url}/services/confirm_request`,
		data
	)
}

export const getServices = (data) => {
	return axios.post(
		`${url}/services/get_services`,
		data
	)
}

export const getServiceInfo = (id) => {
	return axios.get(`${url}/services/get_service_info/${id}`)
}
