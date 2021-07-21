import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = LOCAL_API_URL

export const requestAppointment = (data) => {
	return axios.post(
		`${url}/appointments/request_appointment`, 
		data
	)
}

export const closeRequest = (id) => {
	return axios.get(`${url}/appointments/close_request/${id}`)
}
