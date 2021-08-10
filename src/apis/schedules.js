import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const requestAppointment = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/request_appointment`, 
		data
	)
}

export const acceptReservation = id => {
	return axios.get(`${WIFI_API_URL}/schedules/accept_reservation/${id}`)
}

export const closeRequest = id => {
	return axios.get(`${WIFI_API_URL}/schedules/close_request/${id}`)
}

export const cancelReservationJoining = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/cancel_reservation_joining`,
		data
	)
}

export const acceptReservationJoining = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/accept_reservation_joining`,
		data
	)
}

export const doneDining = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/done_dining`,
		data
	)
}

export const getReservationInfo = id => {
	return axios.get(`${WIFI_API_URL}/schedules/get_reservation_info/${id}`)
}

export const getScheduleInfo = id => {
	return axios.get(`${WIFI_API_URL}/schedules/get_schedule_info/${id}`)
}

export const addItemtoorder = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/add_item_to_order`,
		data
	)
}

export const seeOrders = id => {
	return axios.get(`${WIFI_API_URL}/schedules/see_orders/${id}`)
}

export const sendOrders = id => {
	return axios.get(`${WIFI_API_URL}/schedules/send_orders/${id}`)
}

export const editOrder = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/edit_order`,
		data
	)
}

export const updateOrder = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/update_order`,
		data
	)
}

export const addDiners = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/add_diners`,
		data
	)
}

export const editOrderCallfor = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/edit_order_callfor`,
		data
	)
}

export const updateOrderCallfor = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/update_order_callfor`,
		data
	)
}

export const removeOrderCallfor = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/remove_order_callfor`,
		data
	)
}
