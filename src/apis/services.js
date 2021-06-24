import axios from 'axios'
import { API_URL } from "@env"

const url = `${API_URL}/services/`

export const requestAppointment = (data) => {
	return axios.post(
		url + "request_appointment", 
		data
	)
}

export const cancelPurchase = (data) => {
	return axios.post(
		url + "cancel_purchase",
		data
	)
}

export const confirmPurchase = (data) => {
	return axios.post(
		url + "confirm_purchase",
		data
	)
}

export const cancelRequest = (data) => {
	return axios.post(
		url + "cancel_request",
		data
	)
}

export const confirmRequest = (data) => {
	return axios.post(
		url + "confirm_request",
		data
	)
}
