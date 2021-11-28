import axios from 'axios'
import { url } from '../../assets/info'

export const getLocations = data => {
	return axios.post(
		`${url}/locations/get_locations`,
		data
	)
}

export const getMoreLocations = data => {
	return axios.post(
		`${url}/locations/get_more_locations`,
		data
	)
}

export const getLocationProfile = data => {
	return axios.post(
		`${url}/locations/get_location_profile`,
		data
	)
}

export const makeReservation = data => {
	return axios.post(
		`${url}/locations/make_reservation`,
		data
	)
}

export const getInfo = data => {
	return axios.post(
		`${url}/locations/get_info`,
		data
	)
}

export const getLocationHours = data => {
	return axios.post(
		`${url}/locations/get_hours`,
		data
	)
}

export const getWorkers = id => {
	return axios.get(`${url}/locations/get_workers/${id}`)
}

export const searchWorkers = data => {
	return axios.post(
		`${url}/locations/search_workers`,
		data
	)
}
