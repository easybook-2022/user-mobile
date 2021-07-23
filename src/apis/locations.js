import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = WIFI_API_URL

export const getLocations = (data) => {
	return axios.post(
		`${url}/locations/get_locations`,
		data
	)
}

export const getMoreLocations = (data) => {
	return axios.post(
		`${url}/locations/get_more_locations`,
		data
	)
}

export const getLocationProfile = (data) => {
	return axios.post(
		`${url}/locations/get_location_profile`,
		data
	)
}

export const makeReservation = (data) => {
	return axios.post(
		`${url}/locations/make_reservation`,
		data
	)
}

export const getInfo = (data) => {
	return axios.post(
		`${url}/locations/get_info`,
		data
	)
}

export const getLocationHours = (data) => {
	return axios.post(
		`${url}/locations/get_hours`,
		data
	)
}
