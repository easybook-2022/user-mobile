import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = WIFI_API_URL

export const loginUser = (data) => {
	return axios.post(
		`${url}/users/login`, 
		data
	)
}

export const registerUser = (data) => {
	return axios.post(
		`${url}/users/register`,
		data
	)
}

export const setupUser = (data) => {
	const form = new FormData()

	form.append("userid", data.userid)
	form.append("username", data.username)
	form.append("profile", { uri: data.profile.uri, name: data.profile.name })

	return axios.post(
		`${url}/users/setup`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const updateUser = (data) => {
	const form = new FormData()

	form.append("userid", data.userid)
	form.append("username", data.username)
	form.append("cellnumber", data.phonenumber)
	form.append("profile", { uri: data.profile.uri, name: data.profile.name })

	return axios.post(
		`${url}/users/update`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const getUserInfo = (id) => {
	return axios.get(`${url}/users/get_user_info/${id}`)
}

export const getNotifications = (id) => {
	return axios.get(`${url}/users/get_notifications/${id}`)
}

export const getNumNotifications = (id) => {
	return axios.get(`${url}/users/get_num_notifications/${id}`)
}

export const searchFriends = (data) => {
	return axios.post(
		`${url}/users/search_friends`,
		data
	)
}
