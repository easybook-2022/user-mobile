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

export const getUserInfo = data => {
  const { userid, cancelToken } = data

	return axios.get(
    `${beginUrl}get_user_info/${userid}`,
    { cancelToken }
  )
}

export const getNumNotifications = data => {
  const { userid, cancelToken } = data

	return axios.get(
    `${beginUrl}get_num_notifications/${userid}`,
    { cancelToken }
  )
}

export const getNotifications = data => {
  const { userid, cancelToken } = data

	return axios.get(
    `${beginUrl}get_notifications/${userid}`,
    { cancelToken }
  )
}

export const getCode = data => {
  const { cellnumber, cancelToken } = data

	return axios.get(`${beginUrl}get_reset_code/${cellnumber}`)
}

export const resetPassword = data => {
	return axios.post(
		`${beginUrl}reset_password`,
		data
	)
}
