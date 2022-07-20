import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/users/`

export const verifyUser = cellnumber => {
	return axios.get(`${beginUrl}user_verify/${cellnumber}`)
}

export const loginUser = data => {
	return axios.post(
		`${beginUrl}user_login`, 
		data
	)
}

export const registerUser = data => {
	return axios.post(
		`${beginUrl}user_register`,
		data
	)
}

export const updateUser = data => {
	return axios.post(
		`${beginUrl}update_user`,
		data
	)
}

export const updateNotificationToken = data => {
	return axios.post(
		`${beginUrl}update_user_notification_token`,
		data
	)
}

export const getUserInfo = id => {
	return axios.get(`${beginUrl}get_user_info/${id}`)
}

export const getNumNotifications = id => {
	return axios.get(`${beginUrl}get_num_notifications/${id}`)
}

export const getNotifications = id => {
	return axios.get(`${beginUrl}get_notifications/${id}`)
}

export const getCode = phonenumber => {
	return axios.get(`${beginUrl}get_reset_code/${phonenumber}`)
}

export const resetPassword = data => {
	return axios.post(
		`${beginUrl}reset_password`,
		data
	)
}
