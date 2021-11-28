import axios from 'axios'
import { url } from '../../assets/info'

export const verifyUser = cellnumber => {
	return axios.get(`${url}/users/verify/${cellnumber}`)
}

export const loginUser = data => {
	return axios.post(
		`${url}/users/login`, 
		data
	)
}

export const registerUser = data => {
	return axios.post(
		`${url}/users/register`,
		data
	)
}

export const setupUser = data => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg" } = data.profile

	form.append("userid", data.userid)
	form.append("username", data.username)
	form.append("permission", data.permission)
	form.append("time", data.time)

	if (data.profile.uri) {
		form.append("profile", { uri, name, type })
	}

	return axios.post(
		`${url}/users/setup`,
		form
	)
}

export const updateUser = data => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg" } = data.profile

	form.append("userid", data.userid)
	form.append("username", data.username)
	form.append("cellnumber", data.cellnumber)

	if (data.profile.uri) {
		form.append("profile", { uri, name, type })
	}

	return axios.post(
		`${url}/users/update_user`,
		form
	)
}

export const updateNotificationToken = data => {
	return axios.post(
		`${url}/users/update_notification_token`,
		data
	)
}

export const addPaymentMethod = data => {
	return axios.post(
		`${url}/users/add_paymentmethod`,
		data
	)
}

export const updatePaymentMethod = data => {
	return axios.post(
		`${url}/users/update_paymentmethod`,
		data
	)
}

export const getPaymentMethods = id => {
	return axios.get(`${url}/users/get_payment_methods/${id}`)
}

export const setPaymentmethodDefault = data => {
	return axios.post(
		`${url}/users/set_paymentmethoddefault`,
		data
	)
}

export const getPaymentmethodInfo = data => {
	return axios.post(
		`${url}/users/get_paymentmethod_info`,
		data
	)
}

export const deleteThePaymentMethod = data => {
	return axios.post(
		`${url}/users/delete_paymentmethod`,
		data
	)
}

export const getUserInfo = id => {
	return axios.get(`${url}/users/get_user_info/${id}`)
}

export const getNumUpdates = data => {
	return axios.post(
		`${url}/users/get_num_updates`,
		data
	)
}

export const getNotifications = id => {
	return axios.get(`${url}/users/get_notifications/${id}`)
}

export const getTrialInfo = data => {
	return axios.post(
		`${url}/users/get_trial_info`,
		data
	)
}

export const searchFriends = data => {
	return axios.post(
		`${url}/users/search_friends`,
		data
	)
}

export const searchDiners = data => {
	return axios.post(
		`${url}/users/search_diners`,
		data
	)
}

export const selectUser = id => {
	return axios.get(`${url}/users/select_user/${id}`)
}

export const requestUserPaymentMethod = id => {
	return axios.get(`${url}/users/request_user_payment_method/${id}`)
}

export const cancelRequest = id => {
	return axios.get(`${url}/users/cancel_request/${id}`)
}

export const getCode = phonenumber => {
	return axios.get(`${url}/users/get_reset_code/${phonenumber}`)
}

export const resetPassword = data => {
	return axios.post(
		`${url}/users/reset_password`,
		data
	)
}
