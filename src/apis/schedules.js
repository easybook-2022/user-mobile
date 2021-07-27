import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const requestAppointment = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/request_appointment`, 
		data
	)
}

export const acceptRequest = id => {
	return axios.get(`${WIFI_API_URL}/schedules/accept_request/${id}`)
}

export const closeRequest = id => {
	return axios.get(`${WIFI_API_URL}/schedules/close_request/${id}`)
}

export const getReservationInfo = id => {
	return axios.get(`${WIFI_API_URL}/schedules/get_reservation_info/${id}`)
}
