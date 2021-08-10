import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const loginUser = data => {
	return axios.post(
		`${WIFI_API_URL}/users/login`, 
		data
	)
}

export const registerUser = data => {
	return axios.post(
		`${WIFI_API_URL}/users/register`,
		data
	)
}

export const setupUser = data => {
	const form = new FormData()

	form.append("userid", data.userid)
	form.append("username", data.username)
	form.append("profile", { uri: data.profile.uri, name: data.profile.name })

	return axios.post(
		`${WIFI_API_URL}/users/setup`,
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
		`${WIFI_API_URL}/users/update`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const addPaymentMethod = data => {
	return axios.post(
		`${WIFI_API_URL}/users/add_paymentmethod`,
		data
	)
}

export const getPaymentMethods = id => {
	return axios.get(`${WIFI_API_URL}/users/get_payment_methods/${id}`)
}

export const setPaymentmethodDefault = data => {
	return axios.post(
		`${WIFI_API_URL}/users/set_paymentmethoddefault`,
		data
	)
}

export const getPaymentmethodInfo = data => {
	return axios.post(
		`${WIFI_API_URL}/users/get_paymentmethod_info`,
		data
	)
}

export const deleteThePaymentMethod = data => {
	return axios.post(
		`${WIFI_API_URL}/users/delete_paymentmethod`,
		data
	)
}

export const getUserInfo = id => {
	return axios.get(`${WIFI_API_URL}/users/get_user_info/${id}`)
}

export const getNotifications = id => {
	return axios.get(`${WIFI_API_URL}/users/get_notifications/${id}`)
}

export const getNumUpdates = data => {
	return axios.post(
		`${WIFI_API_URL}/users/get_num_updates`,
		data
	)
}

export const searchFriends = data => {
	return axios.post(
		`${WIFI_API_URL}/users/search_friends`,
		data
	)
}

export const searchDiners = data => {
	return axios.post(
		`${WIFI_API_URL}/users/search_diners`,
		data
	)
}

export const cancelRequest = id => {
	return axios.get(`${WIFI_API_URL}/users/cancel_request/${id}`)
}
