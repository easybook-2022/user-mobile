import axios from 'axios'

const url = "http://localhost:5000/users/"

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
