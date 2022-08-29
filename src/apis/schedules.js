import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/schedules/`

export const makeAppointment = data => {
	return axios.post(
		`${beginUrl}make_appointment`, 
		data
	)
}

export const closeSchedule = data => {
  const { scheduleid, cancelToken } = data

	return axios.get(
    `${beginUrl}close_schedule/${scheduleid}`,
    { cancelToken }
  )
}

export const cancelRequest = data => {
	return axios.post(
    `${beginUrl}cancel_request`,
    data
  )
}

export const getAppointmentInfo = data => {
  const { scheduleid, cancelToken } = data

  return axios.get(
    `${beginUrl}get_appointment_info/${scheduleid}`,
    { cancelToken }
  )
}

export const getExistBooking = data => {
  return axios.post(
    `${beginUrl}/get_exist_booking`,
    data
  )
}
