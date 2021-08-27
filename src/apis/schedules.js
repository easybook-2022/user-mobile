import axios from 'axios'
import { local_api_url, wifi_api_url } from '../../assets/info'

export const requestAppointment = data => {
	return axios.post(
		`${wifi_api_url}/schedules/request_appointment`, 
		data
	)
}

export const acceptReservation = id => {
	return axios.get(`${wifi_api_url}/schedules/accept_request/${id}`)
}

export const closeRequest = id => {
	return axios.get(`${wifi_api_url}/schedules/close_request/${id}`)
}

export const cancelReservationJoining = data => {
	return axios.post(
		`${wifi_api_url}/schedules/cancel_reservation_joining`,
		data
	)
}

export const acceptReservationJoining = data => {
	return axios.post(
		`${wifi_api_url}/schedules/accept_reservation_joining`,
		data
	)
}

export const doneDining = data => {
	return axios.post(
		`${wifi_api_url}/schedules/done_dining`,
		data
	)
}

export const getReservationInfo = id => {
	return axios.get(`${wifi_api_url}/schedules/get_reservation_info/${id}`)
}

export const getScheduleInfo = id => {
	return axios.get(`${wifi_api_url}/schedules/get_schedule_info/${id}`)
}

export const addItemtoorder = data => {
	return axios.post(
		`${wifi_api_url}/schedules/add_item_to_order`,
		data
	)
}

export const seeDiningOrders = id => {
	return axios.get(`${wifi_api_url}/schedules/see_dining_orders/${id}`)
}

export const editDiners = id => {
	return axios.get(`${wifi_api_url}/schedules/edit_diners/${id}`)
}

export const sendOrders = id => {
	return axios.get(`${wifi_api_url}/schedules/send_orders/${id}`)
}

export const editOrder = data => {
	return axios.post(
		`${wifi_api_url}/schedules/edit_order`,
		data
	)
}

export const deleteOrder = data => {
	return axios.post(
		`${wifi_api_url}/schedules/delete_order`,
		data
	)
}

export const updateOrder = data => {
	return axios.post(
		`${wifi_api_url}/schedules/update_order`,
		data
	)
}

export const addDiners = data => {
	return axios.post(
		`${wifi_api_url}/schedules/add_diners`,
		data
	)
}

export const editOrderCallfor = data => {
	return axios.post(
		`${wifi_api_url}/schedules/edit_order_callfor`,
		data
	)
}

export const updateOrderCallfor = data => {
	return axios.post(
		`${wifi_api_url}/schedules/update_order_callfor`,
		data
	)
}

export const removeOrderCallfor = data => {
	return axios.post(
		`${wifi_api_url}/schedules/remove_order_callfor`,
		data
	)
}
