import axios from 'axios'
import { API_URL } from "@env"

const url = `${API_URL}/users/`

export const loginUser = (data) => {
	return axios.post(
		url + "login", 
		data
	)
}

export const registerUser = (data) => {
	return axios.post(
		url + "register",
		data
	)
}
