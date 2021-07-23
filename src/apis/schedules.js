import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = WIFI_API_URL

export const requestAppointment = (data) => {
	return axios.post(
		`${url}/schedules/request_appointment`, 
		data
	)
}

export const closeRequest = (id) => {
	return axios.get(`${url}/schedules/close_request/${id}`)
}
