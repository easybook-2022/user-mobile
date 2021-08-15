import axios from 'axios'
import { local_api_url, wifi_api_url } from '../../assets/info'

export const loginUser = data => {
	return axios.post(
		`${wifi_api_url}/users/login`, 
		data
	)
}

export const registerUser = data => {
	return axios.post(
		`${wifi_api_url}/users/register`,
		data
	)
}

export const setupUser = data => {
	const form = new FormData()

	form.append("userid", data.userid)
	form.append("username", data.username)
	form.append("profile", { uri: data.profile.uri, name: data.profile.name })

	return axios.post(
		`${wifi_api_url}/users/setup`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const updateUser = data => {
	const form = new FormData()

	form.append("userid", data.userid)
	form.append("username", data.username)
	form.append("cellnumber", data.phonenumber)

	if (data.profile.uri) {
		form.append("profile", { uri: data.profile.uri, name: data.profile.name })
	}

	return axios.post(
		`${wifi_api_url}/users/update`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const addPaymentMethod = data => {
	return axios.post(
		`${wifi_api_url}/users/add_paymentmethod`,
		data
	)
}

export const updatePaymentMethod = data => {
	return axios.post(
		`${wifi_api_url}/users/update_paymentmethod`,
		data
	)
}

export const getPaymentMethods = id => {
	return axios.get(`${wifi_api_url}/users/get_payment_methods/${id}`)
}

export const setPaymentmethodDefault = data => {
	return axios.post(
		`${wifi_api_url}/users/set_paymentmethoddefault`,
		data
	)
}

export const getPaymentmethodInfo = data => {
	return axios.post(
		`${wifi_api_url}/users/get_paymentmethod_info`,
		data
	)
}

export const deleteThePaymentMethod = data => {
	return axios.post(
		`${wifi_api_url}/users/delete_paymentmethod`,
		data
	)
}

export const getUserInfo = id => {
	return axios.get(`${wifi_api_url}/users/get_user_info/${id}`)
}

export const getNotifications = id => {
	return axios.get(`${wifi_api_url}/users/get_notifications/${id}`)
}

export const getNumUpdates = data => {
	return axios.post(
		`${wifi_api_url}/users/get_num_updates`,
		data
	)
}

export const searchFriends = data => {
	return axios.post(
		`${wifi_api_url}/users/search_friends`,
		data
	)
}

export const searchDiners = data => {
	return axios.post(
		`${wifi_api_url}/users/search_diners`,
		data
	)
}

export const cancelRequest = id => {
	return axios.get(`${wifi_api_url}/users/cancel_request/${id}`)
}
