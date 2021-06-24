import axios from 'axios'
import { API_URL } from "@env"

const url = `${API_URL}/services/`

export const requestAppointment = (data) => {
	return axios.post(
		url + "request_appointment", 
		data
	)
}
