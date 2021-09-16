import axios from 'axios'
import { url } from '../../assets/info'

export const requestAppointment = data => {
	return axios.post(
		`${url}/schedules/request_appointment`, 
		data
	)
}

export const acceptReservation = data => {
	return axios.post(
		`${url}/schedules/accept_request`,
		data
	)
}

export const closeRequest = id => {
	return axios.get(`${url}/schedules/close_request/${id}`)
}

export const cancelReservationJoining = data => {
	return axios.post(
		`${url}/schedules/cancel_reservation_joining`,
		data
	)
}

export const acceptReservationJoining = data => {
	return axios.post(
		`${url}/schedules/accept_reservation_joining`,
		data
	)
}

export const cancelService = data => {
	return axios.post(
		`${url}/schedules/cancel_service`,
		data
	)
}

export const sendServicePayment = id => {
	return axios.get(`${url}/schedules/send_service_payment/${id}`)
}

export const sendDiningPayment = data => {
	return axios.post(
		`${url}/schedules/send_dining_payment`,
		data
	)
}

export const doneDining = data => {
	return axios.post(
		`${url}/schedules/done_dining`,
		data
	)
}

export const getReservationInfo = id => {
	return axios.get(`${url}/schedules/get_reservation_info/${id}`)
}

export const getScheduleInfo = id => {
	return axios.get(`${url}/schedules/get_schedule_info/${id}`)
}

export const addItemtoorder = data => {
	return axios.post(
		`${url}/schedules/add_item_to_order`,
		data
	)
}

export const seeDiningOrders = id => {
	return axios.get(`${url}/schedules/see_dining_orders/${id}`)
}

export const editDiners = id => {
	return axios.get(`${url}/schedules/edit_diners/${id}`)
}

export const sendOrders = id => {
	return axios.get(`${url}/schedules/send_orders/${id}`)
}

export const editOrder = data => {
	return axios.post(
		`${url}/schedules/edit_order`,
		data
	)
}

export const deleteOrder = data => {
	return axios.post(
		`${url}/schedules/delete_order`,
		data
	)
}

export const updateOrder = data => {
	return axios.post(
		`${url}/schedules/update_order`,
		data
	)
}

export const addDiners = data => {
	return axios.post(
		`${url}/schedules/add_diners`,
		data
	)
}

export const editOrderCallfor = data => {
	return axios.post(
		`${url}/schedules/edit_order_callfor`,
		data
	)
}

export const dinerIsRemovable = data => {
	return axios.post(
		`${url}/schedules/diner_is_removable`,
		data
	)
}

export const dinerIsSelectable = data => {
	return axios.post(
		`${url}/schedules/diner_is_selectable`,
		data
	)
}

export const cancelDiningOrder = data => {
	return axios.post(
		`${url}/schedules/cancel_dining_order`,
		data
	)
}

export const confirmDiningOrder = data => {
	return axios.post(
		`${url}/schedules/confirm_dining_order`,
		data
	)
}

export const updateOrderCallfor = data => {
	return axios.post(
		`${url}/schedules/update_order_callfor`,
		data
	)
}

export const removeOrderCallfor = data => {
	return axios.post(
		`${url}/schedules/remove_order_callfor`,
		data
	)
}
