import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/schedules/`

export const makeAppointment = data => {
	return axios.post(
		`${beginUrl}make_appointment`, 
		data
	)
}

export const closeSchedule = id => {
	return axios.get(`${beginUrl}close_schedule/${id}`)
}

export const cancelRequest = data => {
	return axios.post(
    `${beginUrl}cancel_request`,
    data
  )
}

export const sendServicePayment = data => {
	return axios.post(
		`${beginUrl}send_service_payment`,
		data
	)
}

export const getScheduleInfo = id => {
	return axios.get(`${beginUrl}get_schedule_info/${id}`)
}

export const getAppointmentInfo = id => {
  return axios.get(`${beginUrl}get_appointment_info/${id}`)
}
