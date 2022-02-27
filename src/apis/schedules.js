import axios from 'axios'
import { url } from '../../assets/info'

export const makeAppointment = data => {
	return axios.post(
		`${url}/schedules/make_appointment`, 
		data
	)
}

export const closeSchedule = id => {
	return axios.get(`${url}/schedules/close_schedule/${id}`)
}

export const cancelRequest = data => {
	return axios.post(
    `${url}/schedules/cancel_request`,
    data
  )
}

export const sendServicePayment = data => {
	return axios.post(
		`${url}/schedules/send_service_payment`,
		data
	)
}

export const getScheduleInfo = id => {
	return axios.get(`${url}/schedules/get_schedule_info/${id}`)
}

export const getAppointmentInfo = id => {
  return axios.get(`${url}/schedules/get_appointment_info/${id}`)
}
